import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { ethers } from 'ethers'
import { EthereumRpcMethod } from 'features/ethereum'
import { useWalletsData } from 'hooks'
import * as React from 'react'

import {
  EthereumSessionRequestHandlers,
  WalletConnectSessionRequestCallbackParams,
} from '../@types'
import { getVeridaWalletAccountForWalletConnectRequestOrThrow } from '../utils'

const getEthereumWalletOrThrow = ({
  rpc,
  request,
  walletsData,
  web3wallet,
}: {
  readonly rpc: string
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
  readonly web3wallet: IWeb3Wallet
}) => {
  const provider = new ethers.providers.JsonRpcProvider(rpc)

  const { privateKey } = getVeridaWalletAccountForWalletConnectRequestOrThrow({
    web3wallet,
    request,
    walletsData,
  })

  // HACK: Private keys can be empty because the Vault permits the existence of
  //       watched wallets.
  if (typeof privateKey !== 'string' || !privateKey.length)
    throw new Error(
      'Attempted to instantiate a signer without a valid privateKey!'
    )

  return new ethers.Wallet(privateKey, provider)
}

// https://github.com/WalletConnect/web-examples/blob/d7c56a3beaaf75adb0aa481b2010454339361871/wallets/react-wallet-eip155/src/utils/HelperUtil.ts#L42C1-L55C2
const getSignTypedDataParamsData = (params: string[]) => {
  const data = params.filter((p) => !ethers.utils.isAddress(p))[0]

  return typeof data === 'string' ? JSON.parse(data) : data
}

// https://github.com/WalletConnect/web-examples/blob/d7c56a3beaaf75adb0aa481b2010454339361871/wallets/react-wallet-eip155/src/utils/HelperUtil.ts#L23C1-L29C2
const convertHexToUtf8 = (value: string) =>
  ethers.utils.isHexString(value) ? ethers.utils.toUtf8String(value) : value

// https://github.com/WalletConnect/web-examples/blob/d7c56a3beaaf75adb0aa481b2010454339361871/wallets/react-wallet-eip155/src/utils/HelperUtil.ts#L36
const getSignParamsMessage = (params: string[]) => {
  const message = params.filter((p) => !ethers.utils.isAddress(p))[0]

  return convertHexToUtf8(message)
}

const shouldSignTypedData = ({
  params,
  wallet,
}: {
  readonly params: Web3WalletTypes.EventArguments['session_request']['params']['request']['params']
  readonly wallet: ethers.Wallet
}) => {
  const { domain, types, message: data } = getSignTypedDataParamsData(params)
  // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
  delete types.EIP712Domain
  return wallet._signTypedData(domain, types, data)
}

const shouldSignMessage = ({
  wallet,
  params,
}: {
  readonly wallet: ethers.Wallet
  readonly params: Web3WalletTypes.EventArguments['session_request']['params']['request']['params']
}) => wallet.signMessage(getSignParamsMessage(params))

// https://github.com/WalletConnect/web-examples/blob/d7c56a3beaaf75adb0aa481b2010454339361871/wallets/react-wallet-eip155/src/utils/EIP155RequestHandlerUtil.ts#L37
export function useWalletConnectSessionRequestHandlersEthereumLike(): EthereumSessionRequestHandlers {
  const walletsData = useWalletsData()
  return React.useMemo<EthereumSessionRequestHandlers>(
    () => ({
      [EthereumRpcMethod.PERSONAL_SIGN]: ({
        request,
        rpc,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) =>
        shouldSignMessage({
          wallet: getEthereumWalletOrThrow({
            rpc,
            request,
            walletsData,
            web3wallet,
          }),
          params: request.params.request.params,
        }),
      [EthereumRpcMethod.ETH_SIGN]: ({
        request,
        rpc,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) =>
        shouldSignMessage({
          wallet: getEthereumWalletOrThrow({
            rpc,
            request,
            walletsData,
            web3wallet,
          }),
          params: request.params.request.params,
        }),
      [EthereumRpcMethod.ETH_SIGN_TRANSACTION]: async ({
        rpc,
        request,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) => {
        const wallet = getEthereumWalletOrThrow({
          request,
          rpc,
          walletsData,
          web3wallet,
        })
        const signTransaction = request.params.request.params[0]
        return wallet.signTransaction(signTransaction)
      },
      [EthereumRpcMethod.ETH_SIGN_TYPED_DATA]: ({
        request,
        rpc,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) =>
        shouldSignTypedData({
          params: request.params.request.params,
          wallet: getEthereumWalletOrThrow({
            rpc,
            request,
            walletsData,
            web3wallet,
          }),
        }),
      [EthereumRpcMethod.ETH_SIGN_TYPED_DATA_V3]: ({
        request,
        rpc,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) =>
        shouldSignTypedData({
          params: request.params.request.params,
          wallet: getEthereumWalletOrThrow({
            rpc,
            request,
            walletsData,
            web3wallet,
          }),
        }),
      [EthereumRpcMethod.ETH_SIGN_TYPED_DATA_V4]: ({
        request,
        rpc,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) =>
        shouldSignTypedData({
          params: request.params.request.params,
          wallet: getEthereumWalletOrThrow({
            rpc,
            request,
            walletsData,
            web3wallet,
          }),
        }),
      // https://github.com/WalletConnect/web-examples/blob/d7c56a3beaaf75adb0aa481b2010454339361871/wallets/react-wallet-eip155/src/utils/EIP155RequestHandlerUtil.ts#L21
      [EthereumRpcMethod.ETH_SEND_RAW_TRANSACTION]: async ({
        rpc,
        request,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const wallet = getEthereumWalletOrThrow({
          rpc,
          request,
          walletsData,
          web3wallet,
        })

        // For some reason, WalletConnect have not provided an implementation of send raw transaction.
        // We'll follow suit here in case there's an important reason why.
        // return wallet.sendTransaction(request.params.request.params[0])

        throw new Error(
          `"${EthereumRpcMethod.ETH_SEND_RAW_TRANSACTION}" is not yet supported.`
        )
      },
      [EthereumRpcMethod.ETH_SEND_TRANSACTION]: async ({
        request,
        rpc,
        web3wallet,
      }: WalletConnectSessionRequestCallbackParams) => {
        const wallet = getEthereumWalletOrThrow({
          request,
          rpc,
          walletsData,
          web3wallet,
        })
        const sendTransaction = request.params.request.params[0]
        const { hash } = await wallet.sendTransaction(sendTransaction)
        return hash
      },
    }),
    [walletsData]
  )
}

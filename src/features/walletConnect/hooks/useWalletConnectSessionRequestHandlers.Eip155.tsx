import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { ethers } from 'ethers'
import { getMaybeChainMetadatas, useChainMetadatas } from 'features/blockchain'
import {
  Eip155RpcMethod,
  useBlockchainRequestHandlersEip155,
} from 'features/blockchain/eip155'
import {
  CryptoWalletAccounts,
  useSelectedMinifiedBlockchainAccounts,
} from 'features/cryptoWallet'
import * as React from 'react'
import { $enum } from 'ts-enum-util'

import {
  EthereumSessionRequestHandlers,
  WalletConnectSessionRequestCallbackParams,
} from '../types'
import {
  extractWalletConnectRpcOrThrow,
  getMinifiedBlockchainAccountForWalletConnectRequestOrThrow,
} from '../utils'

const getEthereumWalletOrThrow = ({
  rpc,
  request,
  cryptoWalletAccounts,
  web3wallet,
}: {
  readonly rpc: string
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly cryptoWalletAccounts: CryptoWalletAccounts
  readonly web3wallet: IWeb3Wallet
}) => {
  const provider = new ethers.providers.JsonRpcProvider(rpc)

  const { privateKey } =
    getMinifiedBlockchainAccountForWalletConnectRequestOrThrow({
      web3wallet,
      request,
      minifiedBlockchainAccounts: cryptoWalletAccounts,
    })

  // HACK: Private keys can be empty because the Vault permits the existence of
  //       watched wallets.
  if (typeof privateKey !== 'string' || !privateKey.length)
    throw new Error(
      'Attempted to instantiate a signer without a valid privateKey!'
    )

  return new ethers.Wallet(privateKey, provider)
}

// https://github.com/WalletConnect/web-examples/blob/d7c56a3beaaf75adb0aa481b2010454339361871/wallets/react-wallet-eip155/src/utils/EIP155RequestHandlerUtil.ts#L37
export function useWalletConnectSessionRequestHandlersEip155(): EthereumSessionRequestHandlers {
  const cryptoWalletAccounts = useSelectedMinifiedBlockchainAccounts()
  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const blockchainRequestHandlersEip155 = useBlockchainRequestHandlersEip155()

  return React.useMemo<EthereumSessionRequestHandlers>(
    () =>
      Object.fromEntries(
        [...$enum(Eip155RpcMethod).values()].map((method: Eip155RpcMethod) => [
          method,
          async ({
            request,
            web3wallet,
          }: WalletConnectSessionRequestCallbackParams) =>
            blockchainRequestHandlersEip155[method]({
              context: getEthereumWalletOrThrow({
                rpc: extractWalletConnectRpcOrThrow({
                  chainMetadatas,
                  request,
                }),
                request,
                cryptoWalletAccounts,
                web3wallet,
              }),
              params: request.params.request.params,
              chainId: request.params.chainId,
            }),
        ])
      ) as unknown as EthereumSessionRequestHandlers,
    [cryptoWalletAccounts, chainMetadatas, blockchainRequestHandlersEip155]
  )
}

import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { ethers } from 'ethers'
import {
  Eip155RpcMethod,
  useBlockchainRequestHandlersEip155,
} from 'features/blockchain/eip155'
import { getMaybeChainMetadatas, useChainMetadatas } from 'features/caip'
import {
  MinifiedBlockchainAccounts,
  useSelectedMinifiedBlockchainAccounts,
} from 'features/cryptoWallet'
import * as React from 'react'
import { $enum } from 'ts-enum-util'

import {
  EthereumSessionRequestHandlers,
  WalletConnectSessionRequestCallbackParams,
} from '../@types'
import {
  extractWalletConnectRpcOrThrow,
  getMinifiedBlockchainAccountForWalletConnectRequestOrThrow,
} from '../utils'

const getEthereumWalletOrThrow = ({
  rpc,
  request,
  minifiedBlockchainAccounts,
  web3wallet,
}: {
  readonly rpc: string
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly minifiedBlockchainAccounts: MinifiedBlockchainAccounts
  readonly web3wallet: IWeb3Wallet
}) => {
  const provider = new ethers.providers.JsonRpcProvider(rpc)

  const { privateKey } =
    getMinifiedBlockchainAccountForWalletConnectRequestOrThrow({
      web3wallet,
      request,
      minifiedBlockchainAccounts,
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
  const minifiedBlockchainAccounts = useSelectedMinifiedBlockchainAccounts()
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
                rpc: await extractWalletConnectRpcOrThrow({
                  chainMetadatas,
                  request,
                }),
                request,
                minifiedBlockchainAccounts,
                web3wallet,
              }),
              params: request.params.request.params,
            }),
        ])
      ) as unknown as EthereumSessionRequestHandlers,
    [
      minifiedBlockchainAccounts,
      chainMetadatas,
      blockchainRequestHandlersEip155,
    ]
  )
}

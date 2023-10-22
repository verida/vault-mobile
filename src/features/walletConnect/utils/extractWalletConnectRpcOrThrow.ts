import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { RpcSelector } from 'features/blockchain/@types'
import { ChainMetadatas, getRpcUrlOrThrow } from 'features/caip'

import { extractWalletConnectChainIdOrThrow } from './extractWalletConnectChainIdOrThrow'

export async function extractWalletConnectRpcOrThrow({
  chainMetadatas,
  request,
  rpcSelector,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly rpcSelector: RpcSelector
}): Promise<string> {
  return getRpcUrlOrThrow({
    chainMetadatas,
    chainId: extractWalletConnectChainIdOrThrow({ request }),
    rpcSelector,
  })
}

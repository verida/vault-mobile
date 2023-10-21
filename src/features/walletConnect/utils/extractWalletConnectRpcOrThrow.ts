import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainMetadatas, getRpcUrlOrThrow } from 'features/caip'

import { RpcSelector } from '../@types'
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

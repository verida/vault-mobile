import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainMetadatas, getRpcUrlOrThrow } from 'features/blockchain'

import { extractWalletConnectChainIdOrThrow } from './extractWalletConnectChainIdOrThrow'

export function extractWalletConnectRpcOrThrow({
  chainMetadatas,
  request,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly request: Web3WalletTypes.EventArguments['session_request']
}): string {
  return getRpcUrlOrThrow({
    chainMetadatas,
    chainId: extractWalletConnectChainIdOrThrow({ request }),
  })
}

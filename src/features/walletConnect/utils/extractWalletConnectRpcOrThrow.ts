import { Web3WalletTypes } from '@walletconnect/web3wallet'

import { Blockchain, getRpcUrlOrThrow } from '~/features/blockchain'

import { extractWalletConnectChainIdOrThrow } from './extractWalletConnectChainIdOrThrow'

export function extractWalletConnectRpcOrThrow({
  chainMetadatas,
  request,
}: {
  readonly chainMetadatas: Blockchain[]
  readonly request: Web3WalletTypes.EventArguments['session_request']
}): string {
  return getRpcUrlOrThrow({
    chainMetadatas,
    chainId: extractWalletConnectChainIdOrThrow({ request }),
  })
}

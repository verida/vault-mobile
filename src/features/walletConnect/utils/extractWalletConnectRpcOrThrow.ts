import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'
import { ChainMetadatas, getRpcUrlOrThrow } from 'features/caip'

export function extractWalletConnectRpcOrThrow({
  chainMetadatas,
  request,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly request: Web3WalletTypes.EventArguments['session_request']
}) {
  const maybeChainId = request?.params?.chainId

  const chainId = new ChainId(maybeChainId)

  const rpc = getRpcUrlOrThrow(chainMetadatas, chainId)

  return { rpc, chainId }
}

import { Web3WalletTypes } from '@walletconnect/web3wallet'
import {
  ChainMetadatas,
  getRpcUrlOrThrow,
  parseCaipOrThrow,
} from 'features/caip'

export function extractWalletConnectRpcOrThrow({
  chainMetadatas,
  request,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly request: Web3WalletTypes.EventArguments['session_request']
}) {
  const maybeChainId = request?.params?.chainId

  const parsedCaipType = parseCaipOrThrow(maybeChainId)

  const rpc = getRpcUrlOrThrow(chainMetadatas, parsedCaipType)

  return { rpc, parsedCaipType }
}

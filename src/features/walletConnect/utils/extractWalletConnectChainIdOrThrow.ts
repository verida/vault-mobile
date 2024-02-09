import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'

export function extractWalletConnectChainIdOrThrow({
  request,
}: {
  readonly request: Web3WalletTypes.EventArguments['session_request']
}) {
  const maybeChainId = request?.params?.chainId

  return new ChainId(maybeChainId)
}

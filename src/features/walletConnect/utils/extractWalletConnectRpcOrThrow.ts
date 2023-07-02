import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { getMaybeWalletConnectRpcUriForChainId } from 'features/walletConnect'

export function extractWalletConnectRpcOrThrow(
  web3wallet: IWeb3Wallet,
  request: Web3WalletTypes.EventArguments['session_request']
) {
  const maybeChainId = request?.params?.chainId

  // TODO: This can become polygon. Enumerate supported chains accordingly.
  // TODO: @cawfree We don't know what these are yet.
  if (maybeChainId !== 'ethereum' && maybeChainId !== 'near')
    throw new Error(`Encountered unexpected chainId, "${maybeChainId}".`)

  const rpc = getMaybeWalletConnectRpcUriForChainId(maybeChainId)

  if (typeof rpc !== 'string' || !rpc.length)
    throw new Error(`Expected non-empty string rpc, encountered "${rpc}".`)

  return { rpc, chainId: maybeChainId }
}

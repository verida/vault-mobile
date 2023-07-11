import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { getRpcUrlOrThrow, parseCaipOrThrow } from 'features/caip'

export function extractWalletConnectRpcOrThrow(
  web3wallet: IWeb3Wallet,
  request: Web3WalletTypes.EventArguments['session_request']
) {
  const maybeChainId = request?.params?.chainId

  const parsedCaipType = parseCaipOrThrow(maybeChainId)

  const rpc = getRpcUrlOrThrow(parsedCaipType)

  return { rpc, parsedCaipType }
}

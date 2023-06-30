import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'

export function resolveSessionRequest<ResultType>({
  result,
  request,
  web3wallet,
}: {
  readonly result: ResultType
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly web3wallet: IWeb3Wallet
}) {
  const { id, topic } = request

  __DEV__ &&
    // eslint-disable-next-line no-console
    console.log(
      `[WalletConnect::RPC]: session_request accepted (#${id}, "${topic}")`
    )

  return web3wallet.respondSessionRequest({
    topic,
    response: formatJsonRpcResult(id, result),
  })
}

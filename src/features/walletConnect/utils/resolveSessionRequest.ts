import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'

import { Logger } from '~/features/telemetry'

const logger = Logger.create('WalletConnect')

export function resolveSessionRequest<T>({
  result,
  request,
  web3wallet,
}: {
  readonly result: T
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly web3wallet: IWeb3Wallet
}) {
  const { id, topic } = request

  logger.info(`RPC session_request accepted`, {
    id,
    topic,
  })

  return web3wallet.respondSessionRequest({
    topic,
    response: formatJsonRpcResult(id, result),
  })
}

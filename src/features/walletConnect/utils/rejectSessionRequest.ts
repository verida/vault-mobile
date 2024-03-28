import { formatJsonRpcError } from '@json-rpc-tools/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { Logger } from 'features/telemetry'

const logger = Logger.create('WalletConnect')

export const rejectSessionRequest = ({
  reason,
  request,
  web3wallet,
}: {
  readonly reason: string
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly web3wallet: IWeb3Wallet
}) => {
  Promise.all([
    logger.warn(`RPC session_request rejected`, {
      id: request.id,
      topic: request.topic,
      reason,
    }),
    web3wallet.respondSessionRequest({
      topic: request.topic,
      response: formatJsonRpcError(request.id, reason),
    }),
  ])
}

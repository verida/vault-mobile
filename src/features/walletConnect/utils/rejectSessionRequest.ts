import { formatJsonRpcError } from '@json-rpc-tools/utils'
import * as Sentry from '@sentry/react-native'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'

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
    __DEV__ &&
      // eslint-disable-next-line no-console
      console.error(
        `[WalletConnect::RPC]: session_request rejected (#${request.id}, "${request.topic}", "${reason}")`
      ),
    Sentry.captureException(new Error(reason)),
    web3wallet.respondSessionRequest({
      topic: request.topic,
      response: formatJsonRpcError(request.id, reason),
    }),
  ])
}

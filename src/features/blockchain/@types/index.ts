import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { RpcSelector } from 'features/walletConnect'

export type BlockchainRequestHandlerCallbackParams<Context> = {
  readonly rpcSelector: RpcSelector
  readonly params: Web3WalletTypes.EventArguments['session_request']['params']['request']['params']
  readonly context: Context
}

export type BlockchainRequestHandlerCallback<Context> = (
  params: BlockchainRequestHandlerCallbackParams<Context>
) => Promise<unknown>

export type BlockchainRequestHandlers<
  T extends string | number | symbol,
  Context
> = {
  readonly [key in T]: BlockchainRequestHandlerCallback<Context>
}

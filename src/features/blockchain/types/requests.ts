import { Web3WalletTypes } from '@walletconnect/web3wallet'

export type BlockchainRequestHandlerCallbackParams<Context> = {
  readonly params: Web3WalletTypes.EventArguments['session_request']['params']['request']['params']
  readonly context: Context
  chainId?: string
}

export type BlockchainRequestHandlerCallback<Context> = (
  params: BlockchainRequestHandlerCallbackParams<Context>
) => Promise<unknown>

export type BlockchainRequestHandlers<
  T extends string | number | symbol,
  Context,
> = {
  readonly [key in T]: BlockchainRequestHandlerCallback<Context>
}

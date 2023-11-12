import { Web3WalletTypes } from '@walletconnect/web3wallet'

export * from './enums'

export type BlockchainRequestHandlerCallbackParams<Context> = {
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

// eslint-disable-next-line @typescript-eslint/ban-types
export type BlockchainContextValue = {}

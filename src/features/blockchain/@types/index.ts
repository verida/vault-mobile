import { Web3WalletTypes } from '@walletconnect/web3wallet'

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

// TODO: replace with caip after fix tests
// @aurelticot: I think it's more relevant in the 'blockchains' feature but didn't want to refactor everything using the enum from the 'caip' feature.
// I was not able to use the 'caip' enum, though, because of a weird circular dependency. Hence the duplication here.
// TODO: Remove the 'caip' enum and use this one instead.
export enum SupportedBlockchainNamespace {
  EIP_155 = 'eip155',
  NEAR = 'near',
}

import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainMetadataRpcs } from 'features/caip'

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

// A function which determines how to select an RPC for a given context.
export type RpcSelector = (
  rpcUrls: ChainMetadataRpcs
) => Promise<ChainMetadataRpcs[number]>

export type BlockchainContextValue = {
  readonly rpcSelector: RpcSelector
}

import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { RpcSelector } from 'features/walletConnect'

export type BlockchainRequestHandlerCallbackParams<Wallet> = {
  readonly rpcSelector: RpcSelector
  readonly params: Web3WalletTypes.EventArguments['session_request']['params']['request']['params']
  readonly wallet: Wallet
}

export type BlockchainRequestHandlerCallback<Wallet> = (
  params: BlockchainRequestHandlerCallbackParams<Wallet>
) => Promise<unknown>

export type BlockchainRequestHandlers<T extends string | number | symbol, W> = {
  readonly [key in T]: BlockchainRequestHandlerCallback<W>
}

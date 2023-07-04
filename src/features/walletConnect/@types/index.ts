import { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { EthereumSigningMethod } from 'features/ethereum'
import { NearSigningMethod } from 'features/near'

export enum WalletConnectChainStyle {
  EVM_LIKE = 'EVM_LIKE',
  NEAR_LIKE = 'NEAR_LIKE',
}

export type ActiveSessions = Awaited<
  ReturnType<IWeb3Wallet['getActiveSessions']>
>

export type ActiveSession = ActiveSessions[string]

export type MaybeActiveSession = ActiveSession | undefined

export type WalletConnectContextValue = {
  readonly activeSessions: ActiveSessions
  readonly onRequestConnect: (maybeConnectionUri: unknown) => Promise<void>
  readonly onRequestRefreshActiveSessions: () => Promise<void>
  readonly onRequestDeleteSession: (
    walletConnectSessionKey: string,
    reason: ErrorResponse
  ) => Promise<void>
}

export type WalletConnectChainMeta<ChainStyle extends WalletConnectChainStyle> =
  {
    readonly style: ChainStyle
    readonly chainId: string
    readonly name: string
    readonly logo: string
    readonly rgb: string
    readonly rpc: string
  }

export type Namespaces = ActiveSession['namespaces']
export type MaybeNamespace = Namespaces[string] | undefined

// TODO: instead of chain, namespaceId would be better??
export type ChainToAccounts = {
  readonly [chainId in string]: readonly string[]
}

export type WalletConnectSessionRequestCallbackParams = {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly rpc: string
}

export type WalletConnectSessionRequestCallback<T = unknown> = (
  params: WalletConnectSessionRequestCallbackParams
) => Promise<T>

export type NearSessionRequestHandlers = {
  readonly [key in NearSigningMethod]: WalletConnectSessionRequestCallback
}

export type EthereumSessionRequestHandlers = {
  readonly [key in EthereumSigningMethod]: WalletConnectSessionRequestCallback
}

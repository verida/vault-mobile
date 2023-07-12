import { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import type { EthereumRpcMethod } from 'blockchain/ethereum'
import type { NearSigningMethod } from 'blockchain/near'
import { SupportedCaipProtocolStandard } from 'features/caip'

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

export type Namespaces = ActiveSession['namespaces']
export type MaybeNamespace = Namespaces[string] | undefined

export type CaipProtocolToCaipIdentifiers = {
  readonly [caipProtocol in string]: readonly string[]
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
  readonly [key in EthereumRpcMethod]: WalletConnectSessionRequestCallback
}

export type SupportedCaipProtocolSessionHandlers = {
  readonly [key in SupportedCaipProtocolStandard]: WalletConnectSessionRequestCallback
}

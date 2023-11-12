import { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import { SignClient } from '@walletconnect/sign-client/dist/types/client'
import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { SupportedBlockchainNamespace } from 'features/blockchain/@types/enums'
import type { Eip155RpcMethod } from 'features/blockchain/eip155'
import type { NearRpcMethod } from 'features/blockchain/near'

export type ActiveSessions = Awaited<
  ReturnType<IWeb3Wallet['getActiveSessions']>
>

export type ActiveSession = ActiveSessions[string]

export type MaybeActiveSession = ActiveSession | undefined

// https://github.com/WalletConnect/walletconnect-monorepo/blob/2a4188ee986c3e26a37241601733bcb92018c580/packages/types/src/core/pairing.ts#L75
export type CreatePairingCallbackResult = {
  readonly topic: string
  readonly uri: string
}

export type CreatePairingCallback = () => Promise<CreatePairingCallbackResult>

export type WalletConnectContextValue = {
  readonly activeSessions: ActiveSessions
  readonly createPairing: CreatePairingCallback
  readonly handleQrCodeMessage: (qrCodeMessage: unknown) => Promise<void>
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
}

export type WalletConnectSessionRequestCallback<T = unknown> = (
  params: WalletConnectSessionRequestCallbackParams
) => Promise<T>

export type NearSessionRequestHandlers = {
  readonly [key in NearRpcMethod]: WalletConnectSessionRequestCallback
}

export type EthereumSessionRequestHandlers = {
  readonly [key in Eip155RpcMethod]: WalletConnectSessionRequestCallback
}

export type SupportedCaipProtocolSessionHandlers = {
  readonly [key in SupportedBlockchainNamespace]: WalletConnectSessionRequestCallback
}

export type WalletConnectRequestParams = Parameters<SignClient['request']>[0]

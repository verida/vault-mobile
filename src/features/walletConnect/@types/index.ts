import { ErrorResponse } from '@walletconnect/jsonrpc-utils'
import { SessionTypes } from '@walletconnect/types'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'

export type ActiveSessions = Awaited<
  ReturnType<IWeb3Wallet['getActiveSessions']>
>

export type MaybeActiveSession = ActiveSessions[string] | undefined

export type WalletConnectContextValue = {
  readonly activeSessions: ActiveSessions
  readonly onRequestConnect: (maybeConnectionUri: unknown) => Promise<void>
  readonly onRequestRefreshActiveSessions: () => Promise<void>
  readonly onRequestDeleteSession: (
    walletConnectSessionKey: string,
    reason: ErrorResponse
  ) => Promise<void>
}

// TODO: Hasn't this been defined somewhere else?
export type WalletConnectChainMeta<ChainId> = {
  readonly chainId: ChainId
  readonly name: string
  readonly logo: string
  readonly rgb: string
  readonly rpc: string
}

export type Namespaces = SessionTypes.Namespaces
export type MaybeNamespace = Namespaces[string] | undefined

// TODO: instead of chain, namespaceId would be better??
export type ChainToAccounts = {
  readonly [chainId in string]: readonly string[]
}

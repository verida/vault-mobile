import { IWeb3Wallet } from '@walletconnect/web3wallet'

export type ActiveSessions = Awaited<
  ReturnType<IWeb3Wallet['getActiveSessions']>
>

export type WalletConnectContextValue = {
  readonly activeSessions: ActiveSessions
  readonly onRequestConnect: (maybeConnectionUri: unknown) => Promise<void>
  readonly onRequestRefreshActiveSessions: () => Promise<void>
}

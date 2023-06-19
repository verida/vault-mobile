import { IWeb3Wallet } from '@walletconnect/web3wallet'

export type ActiveSessions = Awaited<
  ReturnType<IWeb3Wallet['getActiveSessions']>
>

export type WalletConnectContextValue = {
  readonly activeSessions: ActiveSessions
  readonly onRequestConnect: (maybeConnectionUri: unknown) => Promise<void>
  readonly onRequestRefreshActiveSessions: () => Promise<void>
}

// TODO: Hasn't this been defined somewhere else?
export type WalletConnectChainMeta<ChainId> = {
  readonly chainId: ChainId
  readonly name: string
  readonly logo: string
  readonly rgb: string
  readonly rpc: string
}

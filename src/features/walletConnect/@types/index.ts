import { IWeb3Wallet } from '@walletconnect/web3wallet'

export type WalletConnectContextValue = {
  readonly maybeWeb3Wallet: IWeb3Wallet | undefined
  readonly onRequestConnect: (maybeConnectionUri: unknown) => Promise<void>
}

export type WalletConnectContextValue = {
  readonly onRequestConnect: (maybeConnectionUri: unknown) => Promise<void>
}

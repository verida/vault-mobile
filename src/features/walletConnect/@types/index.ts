export type WalletConnectContextValue = {
  // TODO: What distinguishes these two things? They probably need to be renamed to
  //       better-reflect application-specific usage.
  readonly onRequestConnect: (maybeConnectionUri: unknown) => Promise<void>
  readonly onHandleConnectionData: (
    maybeConnectionUri: unknown
  ) => Promise<void>
}

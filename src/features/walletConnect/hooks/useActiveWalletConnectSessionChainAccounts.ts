import { useActiveWalletConnectSessionNamespace } from 'features/walletConnect'
import * as React from 'react'

export function useActiveWalletConnectSessionChainAccounts({
  chain,
  walletConnectSessionKey,
}: {
  readonly chain: string
  readonly walletConnectSessionKey: string
}): readonly string[] {
  const maybeNamespace = useActiveWalletConnectSessionNamespace({
    chain,
    walletConnectSessionKey,
  })

  return React.useMemo(() => maybeNamespace?.accounts || [], [maybeNamespace])
}

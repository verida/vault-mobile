import * as React from 'react'

import { useActiveWalletConnectSessionNamespaces } from './useActiveWalletConnectSessionNamespaces'

// WARNING: These are WalletConnect chains and not Verida chainIds.
export function useActiveWalletConnectSessionChains({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey: string | undefined
}): readonly string[] {
  const namespaces = useActiveWalletConnectSessionNamespaces({
    walletConnectSessionKey,
  })

  return React.useMemo(() => Object.keys(namespaces || {}), [namespaces])
}

import * as React from 'react'

import { useActiveWalletConnectSessionNamespaces } from './useActiveWalletConnectSessionNamespaces'

// Returns a string array of caip identifiers i.e. ["eip155:1", "near:testnet"]
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

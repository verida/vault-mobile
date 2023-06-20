import { useActiveWalletConnectSessionNamespaces } from 'features/walletConnect'
import * as React from 'react'

// WARNING: These are WalletConnect chains and not Verida chainIds.
export function useActiveWalletConnectSessionChains({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey: string | undefined
}) {
  const namespaces = useActiveWalletConnectSessionNamespaces({
    walletConnectSessionKey,
  })

  return React.useMemo(() => Object.keys(namespaces || {}), [namespaces])
}

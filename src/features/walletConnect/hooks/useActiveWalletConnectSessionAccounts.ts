import {
  ChainToAccounts,
  getAccountsForMaybeNamespace,
  getNamespaceForChain,
  Namespaces,
  useActiveWalletConnectSessionChains,
  useActiveWalletConnectSessionNamespaces,
} from 'features/walletConnect'
import * as React from 'react'

const getChainsToAccounts = ({
  chains,
  namespaces,
}: {
  readonly chains: readonly string[]
  readonly namespaces: Namespaces
}): ChainToAccounts =>
  Object.fromEntries(
    chains.map(
      (chain: string) =>
        [
          chain,
          getAccountsForMaybeNamespace({
            maybeNamespace: getNamespaceForChain({
              chain,
              namespaces,
            }),
          }),
        ] as const
    )
  )

// Returns a list of all accounts for the active session.
export function useActiveWalletConnectSessionAccounts({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey: string | undefined
}): ChainToAccounts {
  const namespaces = useActiveWalletConnectSessionNamespaces({
    walletConnectSessionKey,
  })
  const sessionChains = useActiveWalletConnectSessionChains({
    walletConnectSessionKey,
  })

  return React.useMemo<ChainToAccounts>(
    () => getChainsToAccounts({ chains: sessionChains, namespaces }),
    [sessionChains, namespaces]
  )
}

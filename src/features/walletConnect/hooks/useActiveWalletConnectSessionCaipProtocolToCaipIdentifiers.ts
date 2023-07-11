import * as React from 'react'

import { CaipProtocolToCaipIdentifiers, Namespaces } from '../@types'
import { getAccountsForMaybeNamespace } from './useActiveWalletConnectSessionChainAccounts'
import { useActiveWalletConnectSessionChains } from './useActiveWalletConnectSessionChains'
import { getNamespaceForChain } from './useActiveWalletConnectSessionNamespace'
import { useActiveWalletConnectSessionNamespaces } from './useActiveWalletConnectSessionNamespaces'

const getCaipProtocolsToCaipIdentifiers = ({
  chains,
  namespaces,
}: {
  readonly chains: readonly string[]
  readonly namespaces: Namespaces
}): CaipProtocolToCaipIdentifiers =>
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
export function useActiveWalletConnectSessionCaipProtocolToCaipIdentifiers({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey: string | undefined
}): CaipProtocolToCaipIdentifiers {
  const namespaces = useActiveWalletConnectSessionNamespaces({
    walletConnectSessionKey,
  })
  const sessionChains = useActiveWalletConnectSessionChains({
    walletConnectSessionKey,
  })

  return React.useMemo<CaipProtocolToCaipIdentifiers>(
    () =>
      getCaipProtocolsToCaipIdentifiers({ chains: sessionChains, namespaces }),
    [sessionChains, namespaces]
  )
}

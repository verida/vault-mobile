import * as React from 'react'

import { MaybeNamespace } from '../@types'
import { useActiveWalletConnectSessionNamespace } from './useActiveWalletConnectSessionNamespace'

export const getAccountsForMaybeNamespace = ({
  maybeNamespace,
}: {
  readonly maybeNamespace: MaybeNamespace
}): readonly string[] => {
  return maybeNamespace?.accounts || []
}

export function useActiveWalletConnectSessionChainAccounts({
  chain,
  walletConnectSessionKey,
}: {
  readonly chain: string
  readonly walletConnectSessionKey: string
}): readonly string[] {
  const maybeNamespace: MaybeNamespace = useActiveWalletConnectSessionNamespace(
    {
      chain,
      walletConnectSessionKey,
    }
  )

  return React.useMemo(
    () => getAccountsForMaybeNamespace({ maybeNamespace }),
    [maybeNamespace]
  )
}

import { useNearContext } from 'features/near'
import * as React from 'react'

export function useMaybeNearWalletAddresses() {
  const { maybeNearWalletAccounts } = useNearContext()
  return React.useMemo(
    /* accountId is synonymous with address for Near */
    () => maybeNearWalletAccounts.map((e) => e.accountId),
    [maybeNearWalletAccounts]
  )
}

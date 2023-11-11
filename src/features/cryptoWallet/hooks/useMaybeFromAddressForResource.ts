import * as React from 'react'

import { AggregateWalletBannerBalance } from '../@types'
import { getFromAddressForResourceOrThrow } from '../utils'
import { useSelectedMinifiedVeridaAccounts } from './useSelectedMinifiedVeridaAccounts'

export function useMaybeFromAddressForResource({
  resource: maybeResource,
}: {
  readonly resource: AggregateWalletBannerBalance['resource'] | null | undefined
}) {
  const selectedMinifiedAccounts = useSelectedMinifiedVeridaAccounts()

  return React.useMemo(() => {
    try {
      if (!maybeResource) throw new Error('Missing resource.')
      return getFromAddressForResourceOrThrow({
        resource: maybeResource,
        selectedMinifiedAccounts,
      })
    } catch (e) {
      return null
    }
  }, [maybeResource, selectedMinifiedAccounts])
}

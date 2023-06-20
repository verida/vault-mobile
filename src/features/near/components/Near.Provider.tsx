import {
  NearNetworkId,
  useCreateOrRestoreNearWalletInstance,
  useMaybeNearWalletAccounts,
  useMaybeNearWalletInstance,
} from 'features/near'
import * as React from 'react'

import { NearContextValue } from '../@types'
import { NearContextProvider } from '../contexts'

export const NearProvider: React.FC<
  React.PropsWithChildren<{
    readonly nearNetwork: NearNetworkId
  }>
> = React.memo(function NearProvider({ children, nearNetwork }): JSX.Element {
  const state = useCreateOrRestoreNearWalletInstance({
    nearNetwork,
  })

  // Manages the allocation of a global Near wallet.
  const maybeNearWalletInstance = useMaybeNearWalletInstance(state)
  const maybeNearWalletAccounts = useMaybeNearWalletAccounts(state)

  return (
    <NearContextProvider
      // eslint-disable-next-line react/no-children-prop
      children={children}
      value={React.useMemo<NearContextValue>(
        () => ({
          maybeNearWalletInstance,
          nearNetwork,
          maybeNearWalletAccounts: maybeNearWalletAccounts || [],
        }),
        [maybeNearWalletInstance, nearNetwork, maybeNearWalletAccounts]
      )}
    />
  )
})

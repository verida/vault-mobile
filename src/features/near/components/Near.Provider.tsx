import {
  NearKeystore,
  NearNetworkId,
  useCreateOrRestoreNearWalletInstance,
} from 'features/near'
import * as React from 'react'

import { NearContextValue } from '../@types'
import { NearContextProvider } from '../contexts'

export const NearProvider: React.FC<
  React.PropsWithChildren<{
    readonly nearNetwork: NearNetworkId
  }>
> = React.memo(function NearProvider({ children, nearNetwork }): JSX.Element {
  const keystore = React.useMemo(() => new NearKeystore(), [])

  useCreateOrRestoreNearWalletInstance({
    nearNetwork,
    keystore,
  })

  return (
    <NearContextProvider
      // eslint-disable-next-line react/no-children-prop
      children={children}
      value={React.useMemo<NearContextValue>(
        () => ({
          nearNetwork,
          keystore,
        }),
        [nearNetwork, keystore]
      )}
    />
  )
})

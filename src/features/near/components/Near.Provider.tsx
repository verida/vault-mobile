import { parseCaipOrThrow, ParsedCaipType } from 'features/caip'
import {
  NearKeystore,
  NearNetworkId,
  useCreateOrRestoreNearWalletInstance,
} from 'features/near'
import * as React from 'react'

import { NearContextValue } from '../@types'
import { NearContextProvider } from '../contexts'

const defaultNearNetworkParsedCaipType = parseCaipOrThrow(NearNetworkId.TESTNET)

export const NearProvider: React.FC<
  React.PropsWithChildren<{
    readonly nearNetworkParsedCaipType?: ParsedCaipType
  }>
> = React.memo(function NearProvider({
  children,
  nearNetworkParsedCaipType = defaultNearNetworkParsedCaipType,
}): JSX.Element {
  const keystore = React.useMemo(() => new NearKeystore(), [])

  useCreateOrRestoreNearWalletInstance({
    nearNetworkParsedCaipType,
    keystore,
  })

  return (
    <NearContextProvider
      // eslint-disable-next-line react/no-children-prop
      children={children}
      value={React.useMemo<NearContextValue>(
        () => ({
          nearNetworkParsedCaipType,
          keystore,
        }),
        [nearNetworkParsedCaipType, keystore]
      )}
    />
  )
})

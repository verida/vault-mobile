import { ChainMetadatas, ParsedCaipType } from 'features/caip'
import * as React from 'react'

import { getSupportedCaipProtocolFriendlyName } from '../utils'

export const CaipSupportedProtocolSpan = React.memo(
  function CaipWalletTypeSpan({
    chainMetadatas,
    parsedCaipType = undefined,
  }: {
    readonly chainMetadatas: ChainMetadatas
    readonly parsedCaipType: ParsedCaipType | undefined
  }): JSX.Element {
    return (
      <React.Fragment
        // eslint-disable-next-line react/no-children-prop
        children={getSupportedCaipProtocolFriendlyName(
          chainMetadatas,
          parsedCaipType
        )}
      />
    )
  }
)

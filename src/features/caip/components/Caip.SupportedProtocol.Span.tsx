import { ChainId } from 'caip'
import { ChainMetadatas } from 'features/caip'
import * as React from 'react'

import { getSupportedCaipProtocolFriendlyName } from '../utils'

export const CaipSupportedProtocolSpan = React.memo(
  function CaipWalletTypeSpan({
    chainMetadatas,
    caipChainId,
  }: {
    readonly chainMetadatas: ChainMetadatas
    readonly caipChainId: ChainId | undefined
  }): JSX.Element {
    return (
      <React.Fragment
        // eslint-disable-next-line react/no-children-prop
        children={getSupportedCaipProtocolFriendlyName(
          chainMetadatas,
          caipChainId
        )}
      />
    )
  }
)

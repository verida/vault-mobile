import { ChainId } from 'caip'
import { ChainMetadatas } from 'features/blockchain'
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
        children={getSupportedCaipProtocolFriendlyName(
          chainMetadatas,
          caipChainId
        )}
      />
    )
  }
)

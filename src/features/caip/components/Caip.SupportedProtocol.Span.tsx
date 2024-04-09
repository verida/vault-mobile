import { ChainId } from 'caip'
import * as React from 'react'

import {
  ChainMetadatas,
  getSupportedCaipProtocolFriendlyName,
} from '~/features/blockchain'

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

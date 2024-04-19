import { ChainId } from 'caip'
import * as React from 'react'

// HACK: Using path to `/types` and `utils` because of import issues in unit tests
import { ChainMetadata } from '~/features/blockchain/types'
import { getSupportedCaipProtocolFriendlyName } from '~/features/blockchain/utils'

export const CaipSupportedProtocolSpan = React.memo(
  function CaipWalletTypeSpan({
    chainMetadatas,
    caipChainId,
  }: {
    readonly chainMetadatas: ChainMetadata[]
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

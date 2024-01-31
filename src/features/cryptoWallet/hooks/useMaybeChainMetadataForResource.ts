import {
  ChainMetadata,
  getMaybeChainMetadatas,
  useChainMetadatas,
} from 'features/blockchain'
import * as React from 'react'

import { ResourceParams } from '../@types'
import { getChainIdParamsFromResourceParams } from '../utils'

export function useMaybeChainMetadataForResource({
  resource,
}: {
  readonly resource: ResourceParams
}): ChainMetadata | null {
  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  return React.useMemo<ChainMetadata | null>(() => {
    if (!resource) return null

    const chainId = getChainIdParamsFromResourceParams(resource)

    return (
      chainMetadatas.find(
        (e) =>
          e.namespace === chainId.namespace && e.reference === chainId.reference
      ) || null
    )
  }, [resource, chainMetadatas])
}

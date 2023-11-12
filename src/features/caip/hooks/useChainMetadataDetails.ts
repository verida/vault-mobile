import * as React from 'react'

import { ChainMetadata } from '../@types'
import { getMaybeChainMetadatas } from './useChainMetadatas.ChainsList'
import { useChainMetadatasCustom } from './useChainMetadatas.Custom'
import { useChainMetadatasRegional } from './useChainMetadatas.Regional'

export function useChainMetadataDetails() {
  const customChainMetadatas = getMaybeChainMetadatas(useChainMetadatasCustom())

  const regionalChainMetadatas = getMaybeChainMetadatas(
    useChainMetadatasRegional()
  )

  const getChainMetadataDetails = React.useCallback(
    (chainMetadata: ChainMetadata) => {
      const { namespace, reference } = chainMetadata

      const isCustom = customChainMetadatas.find(
        (e) => e.namespace === namespace && e.reference === reference
      )
      const isRegional = regionalChainMetadatas.find(
        (e) => e.namespace === namespace && e.reference === reference
      )

      return { isCustom, isRegional }
    },
    [customChainMetadatas, regionalChainMetadatas]
  )

  return { getChainMetadataDetails }
}

import { ChainId } from 'caip'
import { ChainMetadata } from 'features/caip'
import * as React from 'react'

import {
  getMaybeChainMetadatas,
  useChainMetadatasChainsList,
} from './useChainMetadatas.ChainsList'
import { useChainMetadatasCustom } from './useChainMetadatas.Custom'
import { useChainMetadatasRegional } from './useChainMetadatas.Regional'

export function useChainMetadataDetails() {
  /* reserved */
  const chainsListChainsMetadatas = getMaybeChainMetadatas(
    useChainMetadatasChainsList()
  )

  const regionalChainMetadatas = getMaybeChainMetadatas(
    useChainMetadatasRegional()
  )

  /* user defined */
  const customChainMetadatas = getMaybeChainMetadatas(useChainMetadatasCustom())

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

  // Defines whether a particular chain is "reserved" by Verida and
  // custom networks aren't permitted to override them; these are
  // usually networks which have been purposefully defined by the
  // WalletProvider.
  const isReservedChainId = React.useCallback(
    (chainId: ChainId) => {
      const reservedChainIds = [
        ...chainsListChainsMetadatas,
        ...regionalChainMetadatas,
      ].map((e) => new ChainId(e).toString())

      return reservedChainIds.includes(chainId.toString())
    },
    [chainsListChainsMetadatas, regionalChainMetadatas]
  )

  return { getChainMetadataDetails, isReservedChainId }
}

import * as React from 'react'

import { ChainMetadatas, UseChainMetadataState } from '../@types'
import {
  getMaybeChainMetadatas,
  getMaybeChainMetadatasError,
  useChainMetadatasChainsList,
} from './useChainMetadatas.ChainsList'
import { useChainMetadatasCustom } from './useChainMetadatas.Custom'
import { useChainMetadatasRegional } from './useChainMetadatas.Regional'

export function useChainMetadatas(): UseChainMetadataState {
  const chainsListState = useChainMetadatasChainsList()

  const { loading: loadingChainsList } = chainsListState

  const resultChainsList = getMaybeChainMetadatas(chainsListState)
  const errorChainsList = getMaybeChainMetadatasError(chainsListState)

  const {
    loading: loadingCustom,
    result: resultCustom,
    error: errorCustom,
  } = useChainMetadatasCustom()

  const {
    loading: loadingRegional,
    result: resultRegional,
    error: errorRegional,
  } = useChainMetadatasRegional()

  return React.useMemo<UseChainMetadataState>(() => {
    const loading = loadingChainsList || loadingCustom || loadingRegional

    const chainsResult = resultChainsList || []
    const customResult = resultCustom || []
    const regionalResult = resultRegional || []

    const result: ChainMetadatas = [
      ...chainsResult,
      ...regionalResult,
      ...customResult,
    ]

    return {
      loading,
      error: errorChainsList || errorCustom || errorRegional || undefined,

      // This isn't ideal for a couple of reasons:
      //
      // 1. A user's selection may overwrite default settings - they can
      //    brick their app if they use the wrong settings.
      // 2. Duplicate configurations for a single chain may overwrite one-another.
      //
      result,
    }
  }, [
    loadingChainsList,
    loadingCustom,
    loadingRegional,
    resultChainsList,
    resultCustom,
    resultRegional,
    errorChainsList,
    errorCustom,
    errorRegional,
  ])
}

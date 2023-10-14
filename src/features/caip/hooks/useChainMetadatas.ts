import * as React from 'react'

import { ChainMetadatas, UseChainMetadataState } from '../@types'
import {
  getMaybeChainMetadatas,
  getMaybeChainMetadatasError,
  useChainMetadatasChainsList,
} from './useChainMetadatas.ChainsList'
import { useChainMetadatasCustom } from './useChainMetadatas.Custom'

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

  return React.useMemo<UseChainMetadataState>(() => {
    const loading = loadingChainsList || loadingCustom

    const chainsResult = resultChainsList || []
    const customResult = resultCustom || []

    const result: ChainMetadatas = [...chainsResult, ...customResult]

    return {
      loading,
      error: errorChainsList || errorCustom || undefined,

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
    resultChainsList,
    resultCustom,
    errorChainsList,
    errorCustom,
  ])
}

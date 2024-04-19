import { ChainId } from 'caip'
import * as React from 'react'

import { useAppDispatch, useAppSelector } from '~/reduxStore/types'

import {
  addCustomBlockchains,
  getCustomBlockchains,
  getCustomBlockchainsStatus,
  removeCustomBlockchains,
} from '../redux'
import { ChainMetadata, UseChainMetadataState } from '../types'

type UseChainMetadatasCustomResult = UseChainMetadataState & {
  // TODO: Rename to addCustomBlockchains
  readonly addCustomNetworks: (blockchains: readonly ChainMetadata[]) => void

  // TODO: Rename to removeCustomBlockchains
  readonly removeCustomNetworks: (chainIds: readonly ChainId[]) => void
}

/**
 * Interacts with a Verida datastore to pull all of the chains a user has created into
 * the application. These invariably contain non-default network configurations - such
 * as a user's home node, a test environment, or a new blockchain.
 */
// TODO: This schema is **NOT** final - it is just a proof of concept.
// TODO: Rename to useCustomBlockchains
export function useChainMetadatasCustom(): UseChainMetadatasCustomResult {
  const dispatch = useAppDispatch()

  const addCustomNetworks = React.useCallback(
    // TODO: This type is very specific to the wallet_addEthereumWallet flow. We
    //       can generalize later on.
    (blockchains: readonly ChainMetadata[]) => {
      dispatch(addCustomBlockchains({ blockchains }))
    },
    [dispatch]
  )

  const removeCustomNetworks = React.useCallback(
    (chainIds: readonly ChainId[]) => {
      dispatch(removeCustomBlockchains({ chainIds }))
    },
    [dispatch]
  )

  const customBlockchains = useAppSelector(getCustomBlockchains)
  const status = useAppSelector(getCustomBlockchainsStatus)

  return {
    addCustomNetworks,
    removeCustomNetworks,
    result: customBlockchains,
    loading: status.processing,
    error: status.error,
  }
}

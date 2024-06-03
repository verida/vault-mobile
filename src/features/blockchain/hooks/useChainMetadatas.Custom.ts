import { ChainId } from 'caip'
import * as React from 'react'
import { useDispatch, useStore } from 'react-redux'

import {
  ChainMetadata,
  ChainMetadatas,
  UseChainMetadataState,
} from '~/features/caip'
import { RootState, useAppSelector } from '~/reduxStore/types'

import { addCustomNetwork, removeCustomNetwork } from '../redux'
import { BLOCKCHAIN_SLICE_NAME } from '../types'

type UseChainMetadatasCustomResult = UseChainMetadataState & {
  readonly addCustomNetworks: (
    addCustomNetworkParams: readonly ChainMetadata[]
  ) => Promise<ChainMetadatas>

  readonly removeCustomNetworks: (
    addCustomNetworkParams: readonly ChainId[]
  ) => Promise<ChainMetadatas>
}

/**
 * Interacts with a Verida datastore to pull all of the chains a user has created into
 * the application. These invariably contain non-default network configurations - such
 * as a user's home node, a test environment, or a new blockchain.
 */
// TODO: This schema is **NOT** final - it is just a proof of concept.
export function useChainMetadatasCustom(): UseChainMetadatasCustomResult {
  const dispatch = useDispatch()
  const { getState } = useStore<RootState>()

  const addCustomNetworks = React.useCallback(
    // TODO: This type is very specific to the wallet_addEthereumWallet flow. We
    //       can generalize later on.
    async (addCustomNetworkParams: readonly ChainMetadata[]) => {
      await dispatch(addCustomNetwork({ addCustomNetworkParams }))

      // HACK: Although we can receive the result from the call to `dispatch()` above,
      //       the returned types are unsatisfactory, so we request them explicitly
      //       here.
      const { result } = getState()[BLOCKCHAIN_SLICE_NAME].customNetworks

      return result
    },
    [dispatch, getState]
  )

  const removeCustomNetworks = React.useCallback(
    async (chainIds: readonly ChainId[]) => {
      await dispatch(removeCustomNetwork({ chainIds }))

      // HACK: Although we can receive the result from the call to `dispatch()` above,
      //       the returned types are unsatisfactory, so we request them explicitly
      //       here.
      const { result } = getState()[BLOCKCHAIN_SLICE_NAME].customNetworks

      return result
    },
    [dispatch, getState]
  )

  const { result, loading, error } = useAppSelector(
    (state) => state[BLOCKCHAIN_SLICE_NAME].customNetworks
  )

  return { addCustomNetworks, removeCustomNetworks, result, loading, error }
}

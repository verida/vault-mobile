import { AddEthereumChainRequestParams } from 'features/blockchain/eip155/@types'
import * as React from 'react'
import { useDispatch, useStore } from 'react-redux'

import { RootState, useAppSelector } from 'reduxStore/types'

import { CAIP_SLICE_NAME } from '../@types'
import { addCustomEthereumNetwork } from '../slice'

/**
 * Interacts with a Verida datastore to pull all of the chains a user has created into
 * the application. These invariably contain non-default network configurations - such
 * as a user's home node, a test environment, or a new blockchain.
 */
// TODO: This schema is **NOT** final - it is just a proof of concept.
export function useChainMetadatasCustom() {
  const dispatch = useDispatch()
  const { getState } = useStore<RootState>()

  const addCustomEthereumNetworks = React.useCallback(
    // TODO: This type is very specific to the wallet_addEthereumWallet flow. We
    //       can generalize later on.
    async (addEthereumChainRequestParams: AddEthereumChainRequestParams) => {
      await dispatch(
        addCustomEthereumNetwork({ addEthereumChainRequestParams })
      )

      // HACK: Although we can receive the result from the call to `dispatch()` above,
      //       the returned types are unsatisfactory, so we request them explicitly
      //       here.
      const { result } = getState()[CAIP_SLICE_NAME].customNetworks

      return result
    },
    [dispatch, getState]
  )

  const { result, loading, error } = useAppSelector(
    (state) => state[CAIP_SLICE_NAME].customNetworks
  )

  return { addCustomEthereumNetworks, result, loading, error }
}

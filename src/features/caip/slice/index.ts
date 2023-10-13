import { createSlice } from '@reduxjs/toolkit'

import { CAIP_SLICE_NAME, CustomChains } from '../@types'
import { addCustomEthereumNetwork } from './actions'

export type CaipSliceState = {
  customNetworks: CustomChains
}

const initialState: CaipSliceState = {
  customNetworks: { loading: false, result: [] },
}

export const caipSlice = createSlice({
  name: CAIP_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers(builder) {
    /* addCustomNetworks */
    builder
      .addCase(addCustomEthereumNetwork.pending, (state) => {
        const {
          customNetworks: { result },
        } = state

        // HACK: Keep the customNetworks in memory.
        state.customNetworks = { loading: true, result }
      })
      .addCase(
        addCustomEthereumNetwork.fulfilled,
        (state, { payload: result }) => {
          // HACK: Keep the customNetworks in memory.
          state.customNetworks = { loading: false, result }
        }
      )
      .addCase(addCustomEthereumNetwork.rejected, (state, action) => {
        const {
          customNetworks: { result },
        } = state
        // HACK: Keep the customNetworks in memory.
        state.customNetworks = {
          result,
          loading: false,
          error: new Error(action.payload),
        }
      })
  },
})

export * from './actions'

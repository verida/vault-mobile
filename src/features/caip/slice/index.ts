import { createSlice } from '@reduxjs/toolkit'

import { CAIP_SLICE_NAME, CustomChains } from '../@types'
import { addCustomNetwork } from './actions'

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
    /* addCustomNetwork */
    builder
      .addCase(addCustomNetwork.pending, (state) => {
        const {
          customNetworks: { result },
        } = state

        // HACK: Keep the customNetworks in memory.
        state.customNetworks = { loading: true, result }
      })
      .addCase(addCustomNetwork.fulfilled, (state, { payload: result }) => {
        // HACK: Keep the customNetworks in memory.
        state.customNetworks = { loading: false, result }
      })
      .addCase(addCustomNetwork.rejected, (state, action) => {
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

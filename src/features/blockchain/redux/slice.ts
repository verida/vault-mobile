import { createSlice } from '@reduxjs/toolkit'

import { BLOCKCHAIN_SLICE_NAME } from '../constants'
import { CustomChains } from '../types'
import { addCustomNetwork, removeCustomNetwork } from './actions'

export type BlockchainSliceState = {
  customNetworks: CustomChains
}

const initialState: BlockchainSliceState = {
  customNetworks: { loading: false, result: [] },
}

export const blockchainSlice = createSlice({
  name: BLOCKCHAIN_SLICE_NAME,
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

    /* removeCustomNetwork */
    builder
      .addCase(removeCustomNetwork.pending, (state) => {
        const {
          customNetworks: { result },
        } = state

        // HACK: Keep the customNetworks in memory.
        state.customNetworks = { loading: true, result }
      })
      .addCase(removeCustomNetwork.fulfilled, (state, { payload: result }) => {
        // HACK: Keep the customNetworks in memory.
        state.customNetworks = { loading: false, result }
      })
      .addCase(removeCustomNetwork.rejected, (state, action) => {
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

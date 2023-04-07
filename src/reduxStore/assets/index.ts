import { createSlice } from '@reduxjs/toolkit'

import { NFTCollection } from 'api/types'
import { LOG_OUT } from 'reduxStore/general/action-types'

export interface CollectiblesState {
  walletNFTCollections?: Record<string, NFTCollection[]>
}

const initialState: CollectiblesState = {
  walletNFTCollections: {},
}

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(LOG_OUT, () => {
      return initialState
    })
  },
})

export default assetsSlice.reducer

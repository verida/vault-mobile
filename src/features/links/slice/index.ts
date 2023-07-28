import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { RootState } from 'reduxStore/types'

export interface LinksState {
  navigationLink?: string
}

const initialState: LinksState = {
  navigationLink: undefined,
}

export const linksSlice = createSlice({
  name: 'links',
  initialState,
  reducers: {
    setNavigationLink: (state, action: PayloadAction<string>) => {
      state.navigationLink = action.payload
    },
  },
})

// Actions
export const { setNavigationLink } = linksSlice.actions

// Selectors
export const selectNavigationLink = (state: RootState) =>
  state.links.navigationLink

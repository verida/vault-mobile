import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { logout } from '~/features/auth'
import { RootState } from '~/reduxStore/types'

export interface InboxState {
  newMessagesCount: number
}

const initialState: InboxState = {
  newMessagesCount: 0,
}

export const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {
    setNewMessagesCount: (state, action: PayloadAction<number>) => {
      state.newMessagesCount = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      return initialState
    })
  },
})

// Actions
export const { setNewMessagesCount } = inboxSlice.actions

// Selectors
export const selectNewMessagesCount = (state: RootState) =>
  state.inbox.newMessagesCount

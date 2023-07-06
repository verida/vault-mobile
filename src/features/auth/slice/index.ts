import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { RootState } from 'reduxStore/types'

export interface AuthState {
  bioAuthenticated: boolean // FaceID | fingerprint | device passcode
}

const initialState: AuthState = {
  bioAuthenticated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setBioAuthStatus: (state, action: PayloadAction<boolean>) => {
      state.bioAuthenticated = action.payload
    },
  },
})

// Actions
export const { setBioAuthStatus } = authSlice.actions

// Selectors
export const selectIsBioAuthenticated = (state: RootState) =>
  state.auth.bioAuthenticated

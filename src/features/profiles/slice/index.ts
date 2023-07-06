import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { logout } from 'features/auth'

import { RootState } from 'reduxStore/types'

import { PublicProfile } from '../@types'

export interface ProfilesState {
  publicProfileData: PublicProfile
}

const initialState: ProfilesState = {
  publicProfileData: {
    name: '',
    country: '',
    description: '',
  },
}

export const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    setPublicProfileData: (state, action: PayloadAction<PublicProfile>) => {
      state.publicProfileData = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      return initialState
    })
  },
})

// Actions
export const { setPublicProfileData } = profilesSlice.actions

// Selectors
export const selectPublicProfile = (state: RootState) =>
  state.profiles.publicProfileData

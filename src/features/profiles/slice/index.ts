import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { logout } from '~/features/auth'
import { selectAccounts } from '~/features/identities'
import { Logger } from '~/features/telemetry'
import { createAppAsyncThunk, RootState } from '~/reduxStore/types'

import { PublicProfile } from '../types'
import { getPublicProfile } from '../utils'

const logger = Logger.create('Profiles')

const publicProfileEmptyState: PublicProfile = {
  name: '',
}

const loadingDefaultState = {
  loading: false,
  error: undefined,
}

export interface ProfilesState {
  publicProfiles: Record<string, PublicProfile>
  profilesProcessing: Record<
    string,
    {
      loading: boolean
      error?: string
    }
  >
}

const initialState: ProfilesState = {
  publicProfiles: {},
  profilesProcessing: {},
}

/**
 * Public profiles of user's identities
 * Data will be persisted
 */
export const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    setPublicProfileByDid: (
      state,
      action: PayloadAction<{ did: string; publicProfile: PublicProfile }>
    ) => {
      state.publicProfiles[action.payload.did] = action.payload.publicProfile
    },
  },
  extraReducers: (builder) => {
    builder
      // log out the selected identity
      .addCase(logout, (state, action: PayloadAction<{ did?: string }>) => {
        if (action.payload.did) {
          delete state.publicProfiles[action.payload.did]
        }
      })
      // Fetch public profile data
      .addCase(fetchPublicProfileData.pending, (state, action) => {
        const did = action.meta.arg
        state.profilesProcessing[did] = {
          loading: true,
          error: undefined,
        }
      })
      .addCase(fetchPublicProfileData.fulfilled, (state, action) => {
        const did = action.meta.arg
        state.publicProfiles[did] = action.payload!

        state.profilesProcessing[did] = {
          loading: false,
          error: undefined,
        }
      })
      .addCase(fetchPublicProfileData.rejected, (state, action) => {
        const did = action.meta.arg
        state.profilesProcessing[did] = {
          loading: false,
          error: action.payload,
        }
      })
  },
})

// Selectors
export const selectSelectedPublicProfile = (state: RootState) =>
  selectPublicProfileByDid(
    state,
    state.identities?.selectedAccount?.did ?? undefined
  )

export const selectPublicProfiles = (state: RootState) =>
  state.profiles.publicProfiles

export const selectPublicProfileByDid = (state: RootState, did?: string) =>
  state.profiles.publicProfiles[did || ''] ?? publicProfileEmptyState

export const selectPublicProfilesLoadingState = (
  state: RootState,
  did?: string
) => {
  if (!did) {
    return loadingDefaultState
  }
  return state.profiles.publicProfiles[did]?.name // Old data exists so just render it
    ? loadingDefaultState
    : state.profiles.profilesProcessing[did] || loadingDefaultState
}

// Actions
export const { setPublicProfileByDid } = profilesSlice.actions

// Async actions
export const fetchPublicProfileData = createAppAsyncThunk(
  'profiles/fetchPublicProfileData',
  async (did: string, { getState }) => {
    try {
      const state = getState()
      const existingProfile = selectPublicProfileByDid(state, did)

      const fetchedProfile = await getPublicProfile(did)

      return {
        ...existingProfile,
        ...fetchedProfile,
      }
    } catch (error) {
      // Failing to fetch the profile is not uncommon as some identity may not have any
      logger.warn('Error while getting public profile', { error })

      return {
        name: '',
      }
    }
  }
)

export const fetchAllPublicProfilesData = createAppAsyncThunk(
  'profiles/fetchAllPublicProfileData',
  async (_, { getState, dispatch, signal, rejectWithValue }) => {
    if (signal.aborted) {
      return rejectWithValue('Cancel request')
    }
    const accounts = selectAccounts(getState())
    Object.values(accounts).forEach((account) => {
      dispatch(fetchPublicProfileData(account.did))
    })
  }
)

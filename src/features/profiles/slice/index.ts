import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { logout } from 'features/auth'
import { selectAccounts } from 'features/identities'
import { Logger } from 'features/telemetry'

import AccountManager from 'api/AccountManager'
import { createAppAsyncThunk, RootState } from 'reduxStore/types'

import { PublicProfile } from '../@types'

const logger = new Logger('Profiles')

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
  did: string
) =>
  state.profiles.publicProfiles[did]?.name // Old data exists so just render it
    ? loadingDefaultState
    : state.profiles.profilesProcessing[did] || loadingDefaultState

// Actions
export const { setPublicProfileByDid } = profilesSlice.actions

// Async actions
export const fetchPublicProfileData = createAppAsyncThunk(
  'profiles/fetchPublicProfileData',
  async (did: string, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      let publicProfile = { ...selectPublicProfileByDid(state, did) }

      const fetchedProfile =
        await AccountManager.getInstance().context?.openProfile(
          'basicProfile',
          did
        )

      const avatar = await fetchedProfile?.get('avatar')
      const name = await fetchedProfile?.get('name')
      const country = await fetchedProfile?.get('country')
      const website = await fetchedProfile?.get('website')

      publicProfile = {
        ...publicProfile,
        avatar: avatar,
        name,
        country,
        website,
      }

      return publicProfile as PublicProfile
    } catch (error) {
      logger.error(error)
      return rejectWithValue(
        `Failed to load public profile for DID ${did}: ${
          error instanceof Error ? error.message : ''
        }`
      )
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

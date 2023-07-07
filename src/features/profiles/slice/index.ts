import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/react-native'
import { logout } from 'features/auth'
import { selectAccounts } from 'features/identities'

import AccountManager from 'api/AccountManager'
import { createAppAsyncThunk, RootState } from 'reduxStore/types'

import { PublicProfile } from '../@types'

const publicProfileEmptyState: PublicProfile = {
  name: '',
  country: '',
  description: '',
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
      .addCase(logout, () => {
        return initialState
      })
      //Fetch public profile data
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
  selectPublicProfileByDid(state, state.identities.selectedAccount!.did!)

export const selectPublicProfiles = (state: RootState) =>
  state.profiles.publicProfiles

export const selectPublicProfileByDid = (state: RootState, did: string) =>
  state.profiles.publicProfiles[did] || publicProfileEmptyState

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

      const externalProfile =
        await AccountManager.getInstance().context?.openProfile(
          'basicProfile',
          did
        )

      const avatar = await externalProfile?.get('avatar')
      const name = await externalProfile?.get('name')
      const country = await externalProfile?.get('country')

      publicProfile = {
        ...publicProfile,
        avatar: avatar,
        name,
        country,
      }

      return publicProfile as PublicProfile
    } catch (e: any) {
      rejectWithValue(
        `Failed to load public profile for DID ${did}: ${e.message}`
      )
      Sentry.captureException(e)
    }
  }
)

export const fetchAllPublicProfilesData = createAppAsyncThunk(
  'profiles/fetchAllPublicProfileData',
  async (_, { getState, dispatch }) => {
    const accounts = selectAccounts(getState())
    Object.values(accounts).forEach((account) => {
      dispatch(fetchPublicProfileData(account.did))
    })
  }
)

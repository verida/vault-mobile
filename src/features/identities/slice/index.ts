import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'

import { logout } from '~/features/auth'
import { Account } from '~/features/identities'
import { Sentry } from '~/features/telemetry'
import { RootState } from '~/reduxStore/types'

export interface IdentitiesState {
  accounts: Record<string, Account> // FIXME: we keep the old Account term, but it should be Identity
  selectedAccount?: Account
  switchAccountToast?: { name: string; avatar: { uri: string } }
}

const initialState: IdentitiesState = {
  accounts: {},
  selectedAccount: undefined,
  switchAccountToast: undefined,
}

export const identitiesSlice = createSlice({
  name: 'identities',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<Record<string, Account>>) => {
      // FIXME: The accounts object should be cloned to be detached from the instance variable in Account Manager
      state.accounts = cloneDeep(action.payload)
    },
    setSelectedAccount: (state, action: PayloadAction<Account | undefined>) => {
      // FIXME: The account object should be cloned to be detached from the instance variable in Account Manager
      state.selectedAccount = cloneDeep(action.payload)
      if (action.payload?.did) {
        Sentry.setUser({ id: action.payload?.did })
      } else {
        Sentry.setUser(null)
      }
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      // FIXME: The account object should be cloned to be detached from the instance variable in Account Manager
      state.accounts[action.payload.did] = cloneDeep(action.payload)
    },
    setSwitchAccountToast: (
      state,
      action: PayloadAction<IdentitiesState['switchAccountToast']>
    ) => {
      state.switchAccountToast = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // log out the selected identity
      .addCase(logout, (state, action: PayloadAction<{ did?: string }>) => {
        if (action.payload.did) {
          delete state.accounts[action.payload.did]
          if (state.selectedAccount?.did === action.payload.did) {
            state.selectedAccount = undefined
          }
        }
      })
  },
})

// Actions
export const {
  setAccounts,
  setSelectedAccount,
  addAccount,
  setSwitchAccountToast,
} = identitiesSlice.actions

// Selectors
export const selectSwitchAccountToast = (state: RootState) =>
  state.identities.switchAccountToast

export const selectAccounts = (state: RootState) => state.identities.accounts

export const selectSelectedAccount = (state: RootState) =>
  state.identities?.selectedAccount

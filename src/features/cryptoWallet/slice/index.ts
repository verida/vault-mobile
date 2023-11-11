import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { logout } from 'features/auth'

import { BlockchainWalletWithAccounts } from 'api/types'

import {
  addWatchedWallet,
  createNewWallet,
  deleteWallet,
  importWallet,
  renameWallet,
} from './actions'

export interface WalletState {
  walletsData: Record<string, BlockchainWalletWithAccounts>
  selectedWalletId?: string
  walletProcessing: {
    loading: boolean
    error?: string
  }
}

const initialState: WalletState = {
  walletsData: {},
  selectedWalletId: undefined,
  walletProcessing: {
    loading: false,
    error: undefined,
  },
}

export const cryptoWalletSlice = createSlice({
  name: 'cryptoWallet',
  initialState,
  reducers: {
    saveUserWallets: (
      state,
      action: PayloadAction<Record<string, BlockchainWalletWithAccounts>>
    ) => {
      state.walletsData = action.payload
    },
    removeUserWallets: () => {
      return initialState
    },
    setSelectedWallet: (state, action: PayloadAction<string>) => {
      state.selectedWalletId = action.payload
    },
  },
  extraReducers(builder) {
    builder
      // Log out
      .addCase(logout, () => initialState)

      // Create new wallet
      .addCase(createNewWallet.pending, (state) => {
        state.walletProcessing = {
          loading: true,
          error: undefined,
        }
      })
      .addCase(createNewWallet.fulfilled, (state) => {
        state.walletProcessing = {
          loading: false,
          error: undefined,
        }
      })
      .addCase(createNewWallet.rejected, (state, action) => {
        state.walletProcessing = {
          loading: false,
          error: action.payload,
        }
      })

      // Import a wallet
      .addCase(importWallet.pending, (state) => {
        state.walletProcessing = {
          loading: true,
          error: undefined,
        }
      })
      .addCase(importWallet.fulfilled, (state) => {
        state.walletProcessing = {
          loading: false,
          error: undefined,
        }
      })
      .addCase(importWallet.rejected, (state, action) => {
        state.walletProcessing = {
          loading: false,
          error: action.payload,
        }
      })

      // Add watched wallet
      .addCase(addWatchedWallet.pending, (state) => {
        state.walletProcessing = {
          loading: true,
          error: undefined,
        }
      })
      .addCase(addWatchedWallet.fulfilled, (state) => {
        state.walletProcessing = {
          loading: false,
          error: undefined,
        }
      })
      .addCase(addWatchedWallet.rejected, (state, action) => {
        state.walletProcessing = {
          loading: false,
          error: action.payload,
        }
      })

      // Delete Wallet
      .addCase(deleteWallet.pending, (state) => {
        state.walletProcessing = {
          loading: true,
          error: undefined,
        }
      })
      .addCase(deleteWallet.fulfilled, (state) => {
        state.walletProcessing = {
          loading: false,
          error: undefined,
        }
      })
      .addCase(deleteWallet.rejected, (state, action) => {
        state.walletProcessing = {
          loading: false,
          error: action.payload,
        }
      })

      // Rename Wallet
      .addCase(renameWallet.pending, (state) => {
        state.walletProcessing = {
          loading: true,
          error: undefined,
        }
      })
      .addCase(renameWallet.fulfilled, (state) => {
        state.walletProcessing = {
          loading: false,
          error: undefined,
        }
      })
      .addCase(renameWallet.rejected, (state, action) => {
        state.walletProcessing = {
          loading: false,
          error: action.payload,
        }
      })
  },
})

// Actions
export const { saveUserWallets, setSelectedWallet, removeUserWallets } =
  cryptoWalletSlice.actions

export * from './actions'

// Selectors
export * from './selectors'

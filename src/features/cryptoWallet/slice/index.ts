import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { logout } from 'features/auth'
import { BlockchainWalletWithAccounts } from 'features/blockchain'

import {
  addWatchedWallet,
  createNewWallet,
  deleteWallet,
  importWallet,
  renameWallet,
} from './actions'

export interface CryptoWalletsState {
  wallets: Record<string, BlockchainWalletWithAccounts>
  selectedWalletId: string | null
  status: {
    processsing: boolean
    error?: string
  }
}

const initialState: CryptoWalletsState = {
  wallets: {},
  selectedWalletId: null,
  status: {
    processsing: false,
    error: undefined,
  },
}

export const cryptoWalletSlice = createSlice({
  name: 'cryptoWallet',
  initialState,
  reducers: {
    saveCryptoWallets: (
      state,
      action: PayloadAction<Record<string, BlockchainWalletWithAccounts>>
    ) => {
      state.wallets = action.payload
    },
    clearCryptoWallets: () => {
      return initialState
    },
    setSelectedCryptoWalletId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedWalletId = action.payload
    },
  },
  extraReducers(builder) {
    builder
      // Log out
      .addCase(logout, () => initialState)

      // Create new wallet
      .addCase(createNewWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(createNewWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(createNewWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Import a wallet
      .addCase(importWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(importWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(importWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Add watched wallet
      .addCase(addWatchedWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(addWatchedWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(addWatchedWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Delete Wallet
      .addCase(deleteWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(deleteWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(deleteWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Rename Wallet
      .addCase(renameWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(renameWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(renameWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })
  },
})

// Actions
export const {
  saveCryptoWallets,
  setSelectedCryptoWalletId,
  clearCryptoWallets,
} = cryptoWalletSlice.actions

export * from './actions'

// Selectors
export * from './selectors'

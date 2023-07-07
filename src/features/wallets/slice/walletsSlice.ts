import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { BlockchainWalletWithAccounts } from 'api/types'

import { Transaction } from '../@types'
import {
  addWatchedWallet,
  createNewWallet,
  deleteWallet,
  getTransactionParams,
  importWallet,
  renameWallet,
  sendTransaction,
} from './actions'

export interface WalletState {
  transactionParams: {
    fetching: boolean
    error?: string
    data: Record<string, any> // TOO: type
  }

  sentTransaction: {
    fetching: boolean
    error?: string
    data: Record<string, any> // TOO: type
  }

  pendingTransactions: {
    data: Transaction[]
  }

  walletsData: Record<string, BlockchainWalletWithAccounts>
  selectedWalletId?: string
  walletProcessing: {
    loading: boolean
    error?: string
  }
}

const initialState: WalletState = {
  transactionParams: {
    data: {},
    fetching: false,
    error: undefined,
  },
  sentTransaction: {
    fetching: false,
    data: {},
  },
  pendingTransactions: {
    data: [],
  },
  walletsData: {},
  selectedWalletId: undefined,

  walletProcessing: {
    loading: false,
    error: undefined,
  },
}

export const walletsSlice = createSlice({
  name: 'wallets',
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
      // getTransactionParams
      .addCase(getTransactionParams.pending, (state) => {
        state.transactionParams = { fetching: true, error: undefined, data: {} }
      })
      .addCase(getTransactionParams.fulfilled, (state, action) => {
        state.transactionParams = {
          fetching: true,
          error: undefined,
          data: action.payload,
        }
      })
      .addCase(getTransactionParams.rejected, (state, action) => {
        state.transactionParams = {
          fetching: false,
          error: action.error.message,
          data: {},
        }
      })

      // TODO: Test, Send transaction
      .addCase(sendTransaction.pending, (state) => {
        state.sentTransaction = { fetching: true, error: undefined, data: {} }
      })
      .addCase(
        sendTransaction.fulfilled,
        (state, action: PayloadAction<any>) => {
          const amount = action.payload.amount.toHexString()
          state.sentTransaction = {
            fetching: false,
            error: undefined,
            data: {
              ...action.payload,
              amount,
            },
          }
          state.pendingTransactions = {
            data: [action.payload, ...state.pendingTransactions.data],
          }
        }
      )
      .addCase(sendTransaction.rejected, (state, action) => {
        state.sentTransaction = {
          fetching: false,
          error: action.error.message,
          data: {},
        }
      })

      // Create new Wallet
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
          error: action.error.message,
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
          error: action.error.message,
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
          error: action.error.message,
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
          error: action.error.message,
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
          error: action.error.message,
        }
      })
  },
})

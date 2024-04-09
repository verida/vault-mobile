import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import AccountManager from '~/api/AccountManager'
import { logout } from '~/features/auth'
import { Logger } from '~/features/telemetry'
import { createAppAsyncThunk } from '~/reduxStore/types'

import { VAULT_SCHEMA_WALLETS_0_2_0 } from '../constants'
import {
  AddWatchedCryptoWalletData,
  CreateCryptoWalletData,
  CryptoWalletsReduxState,
  ImportCryptoWalletData,
  UpdateCryptoWalletData,
} from '../types'
import { WalletManager } from '../utils'
import { getSelectedCryptoWalletId } from './selectors'

const logger = Logger.create('CryptoWallets')

const initialState: CryptoWalletsReduxState = {
  wallets: [],
  selectedWalletId: null,
  status: {
    processsing: false,
    error: undefined,
  },
}

export const cryptoWalletSlice = createSlice({
  name: 'cryptoWallets',
  initialState,
  reducers: {
    saveCryptoWallets: (
      state,
      action: PayloadAction<CryptoWalletsReduxState['wallets']>
    ) => {
      state.wallets = action.payload
    },
    clearCryptoWalletsState: () => {
      return initialState
    },
    setSelectedCryptoWalletId: (
      state,
      action: PayloadAction<CryptoWalletsReduxState['selectedWalletId']>
    ) => {
      state.selectedWalletId = action.payload
    },
  },
  extraReducers(builder) {
    builder
      // Log out
      .addCase(logout, () => initialState)

      // Create a wallet
      .addCase(createCryptoWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(createCryptoWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(createCryptoWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Import a wallet
      .addCase(importCryptoWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(importCryptoWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(importCryptoWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Add a watched wallet
      .addCase(addWatchedCryptoWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(addWatchedCryptoWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(addWatchedCryptoWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Delete a wallet
      .addCase(deleteCryptoWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(deleteCryptoWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(deleteCryptoWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Update a wallet
      .addCase(updateCryptoWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(updateCryptoWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(updateCryptoWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Select a wallet
      .addCase(selectCryptoWallet.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(selectCryptoWallet.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(selectCryptoWallet.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Clear the state and local storage
      .addCase(clearCryptoWallets.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(clearCryptoWallets.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(clearCryptoWallets.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })

      // Restore the wallets
      .addCase(restoreCryptoWallets.pending, (state) => {
        state.status = {
          processsing: true,
          error: undefined,
        }
      })
      .addCase(restoreCryptoWallets.fulfilled, (state) => {
        state.status = {
          processsing: false,
          error: undefined,
        }
      })
      .addCase(restoreCryptoWallets.rejected, (state, action) => {
        state.status = {
          processsing: false,
          error: action.payload,
        }
      })
  },
})

// Not exposing the reducer externally because it's not as simple as updating the redux state. We also need to keep the local storage and Vault datastore in sync. So using the thunks below instead.
const {
  saveCryptoWallets,
  setSelectedCryptoWalletId,
  clearCryptoWalletsState,
} = cryptoWalletSlice.actions

// There are a lot of thunks because we're dealing with asynchronous operations to keep the Vault datastore and the local storage in sync.

export const selectCryptoWallet = createAppAsyncThunk(
  'cryptoWallets/selectCryptoWallet',
  async (id: string, { dispatch }) => {
    dispatch(setSelectedCryptoWalletId(id))
    await WalletManager.selectCryptoWallet(id)
  }
)

export const clearCryptoWallets = createAppAsyncThunk(
  'cryptoWallets/clearCryptoWallets',
  async (_undefined: undefined, { dispatch }) => {
    dispatch(clearCryptoWalletsState())
    await WalletManager.clearCachedCryptoWallets()
  }
)

export const createCryptoWallet = createAppAsyncThunk(
  'cryptoWallets/createCryptoWallet',
  async (data: CreateCryptoWalletData, { rejectWithValue, dispatch }) => {
    try {
      const walletsDatastore = await getWalletsDatastore()

      const { selectedWalletId, wallets } =
        await WalletManager.createCryptoWallet(walletsDatastore, data)

      dispatch(saveCryptoWallets(wallets))
      dispatch(setSelectedCryptoWalletId(selectedWalletId))
    } catch (error) {
      logger.error(
        new Error('Failed to create crypto wallet', { cause: error })
      )
      return rejectWithValue('Failed to create crypto wallet')
    }
  }
)

export const importCryptoWallet = createAppAsyncThunk(
  'cryptoWallets/importCryptoWallet',
  async (data: ImportCryptoWalletData, { rejectWithValue, dispatch }) => {
    try {
      const walletsDatastore = await getWalletsDatastore()

      const { selectedWalletId, wallets } =
        await WalletManager.importCryptoWallet(walletsDatastore, data)

      dispatch(saveCryptoWallets(wallets))
      dispatch(setSelectedCryptoWalletId(selectedWalletId))
    } catch (error) {
      logger.error(
        new Error('Failed to import crypto wallet', { cause: error })
      )
      return rejectWithValue('Failed to import crypto wallet')
    }
  }
)

export const addWatchedCryptoWallet = createAppAsyncThunk(
  'cryptoWallets/addWatchedCryptoWallet',
  async (data: AddWatchedCryptoWalletData, { rejectWithValue, dispatch }) => {
    try {
      const walletsDatastore = await getWalletsDatastore()

      const { selectedWalletId, wallets } =
        await WalletManager.addWatchedCryptoWallet(walletsDatastore, data)

      dispatch(saveCryptoWallets(wallets))
      dispatch(setSelectedCryptoWalletId(selectedWalletId))
    } catch (error) {
      logger.error(
        new Error('Failed to add watched crypto wallet', { cause: error })
      )
      return rejectWithValue('Failed to add watched crypto wallet')
    }
  }
)

export const deleteCryptoWallet = createAppAsyncThunk(
  'cryptoWallets/deleteCryptoWallet',
  async (walletId: string, { getState, rejectWithValue, dispatch }) => {
    try {
      const walletsDatastore = await getWalletsDatastore()

      const currentlySelectedWallet = getSelectedCryptoWalletId(getState())

      const { selectedWalletId, wallets } =
        await WalletManager.deleteCryptoWallet(
          walletsDatastore,
          walletId,
          currentlySelectedWallet
        )

      dispatch(saveCryptoWallets(wallets))
      dispatch(setSelectedCryptoWalletId(selectedWalletId))
    } catch (error) {
      logger.error(
        new Error('Failed to delete crypto wallet', { cause: error })
      )
      return rejectWithValue('Failed to delete crypto wallet')
    }
  }
)

export const updateCryptoWallet = createAppAsyncThunk(
  'cryptoWallets/updateCryptoWallet',
  async (
    { walletId, data }: { walletId: string; data: UpdateCryptoWalletData },
    { rejectWithValue, dispatch }
  ) => {
    // TODO: Change this function to edit instead of just rename, but still control what properties are being edited.

    try {
      const walletsDatastore = await getWalletsDatastore()

      const { selectedWalletId, wallets } =
        await WalletManager.updateCryptoWallet(walletsDatastore, walletId, data)

      dispatch(saveCryptoWallets(wallets))
      dispatch(setSelectedCryptoWalletId(selectedWalletId))
    } catch (error) {
      logger.error(
        new Error('Failed to rename crypto wallet', { cause: error })
      )
      return rejectWithValue('Failed to rename crypto wallet')
    }
  }
)

export const restoreCryptoWallets = createAppAsyncThunk(
  'cryptoWallets/restoreCryptoWallets',
  async (_undefined: undefined, { getState, dispatch, rejectWithValue }) => {
    try {
      const walletsDatastore = await getWalletsDatastore()

      const currentlySelectedWalletId = getSelectedCryptoWalletId(getState())

      const { selectedWalletId, wallets } =
        await WalletManager.restoreCryptoWallets(
          walletsDatastore,
          currentlySelectedWalletId
        )

      dispatch(saveCryptoWallets(wallets))
      dispatch(setSelectedCryptoWalletId(selectedWalletId))
    } catch (error) {
      logger.error(
        new Error('Failed to restore crypto wallets', { cause: error })
      )
      return rejectWithValue('Failed to restore crypto wallets')
    }
  }
)

async function getWalletsDatastore() {
  // AccountManager is a singleton outside the React tree, switching identities are not properly handled, so need to reftech the current context
  const walletsDatastore =
    await AccountManager.getInstance().context?.openDatastore(
      VAULT_SCHEMA_WALLETS_0_2_0
    )
  if (!walletsDatastore) {
    throw new Error('Failed to open wallets datastore')
  }
  return walletsDatastore
}

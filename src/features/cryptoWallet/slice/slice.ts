import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import AccountManager from '~/api/AccountManager'
import {
  SELECTED_WALLET_STORAGE_KEY,
  WALLETS_STORAGE_KEY,
} from '~/constants/storageKeys'
import { logout } from '~/features/auth'
import {
  BlockchainWallet,
  BlockchainWalletWithAccounts,
} from '~/features/blockchain'
import { VAULT_SCHEMA_WALLETS_0_2_0 } from '~/features/veridaVault'
import * as SecureStore from '~/helpers/VeridaSecureStore'
import { createAppAsyncThunk } from '~/reduxStore/types'

import { WalletManager } from '../utils'
import { getAllWallets, getSelectedWalletId } from './selectors'

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

export const {
  saveCryptoWallets,
  setSelectedCryptoWalletId,
  clearCryptoWallets,
} = cryptoWalletSlice.actions

export const createNewWallet = createAppAsyncThunk(
  'cryptoWallets/createNewWallet',
  async (
    data: { phrase: string; name: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const { selectedWallet, wallets } =
        await WalletManager.createCryptoWallet(data.phrase, data.name)

      if (wallets) {
        dispatch(saveCryptoWallets(wallets))
        dispatch(setSelectedCryptoWalletId(selectedWallet._id))

        // save to the secure storage..
        await Promise.all([
          SecureStore.setItemAsync(
            WALLETS_STORAGE_KEY,
            JSON.stringify(wallets)
          ),
          SecureStore.setItemAsync(
            SELECTED_WALLET_STORAGE_KEY,
            selectedWallet._id
          ),
        ])
      }
    } catch (error) {
      return rejectWithValue('Could not create wallet')
    }
  }
)

export const importWallet = createAppAsyncThunk(
  'cryptoWallets/importWallet',
  async (
    data: {
      name: string
      inputSwitch: string
      phrase: string
      walletType: string
      privateKey: string
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const mnemonic = data.inputSwitch === 'seedPhrase' ? data.phrase : null
      const privateKey =
        data.inputSwitch === 'privateKey' ? data.privateKey : null
      const walletType = data.walletType

      // save mnemonic to verida store
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          VAULT_SCHEMA_WALLETS_0_2_0
        )

      const wallet: Partial<BlockchainWallet> = {
        walletType,
        label: data.name,
      }
      if (mnemonic) wallet.mnemonic = mnemonic
      if (privateKey) wallet.privateKey = privateKey
      const saved = (await walletDb?.save(wallet, {})) as { id: string } // FIXME: Temp, this is not optimal, should be able specified by a generic type

      const walletId = saved?.id

      dispatch(setSelectedCryptoWalletId(walletId))
      dispatch(restoreCryptoWallets({ clearWallets: false }))
    } catch (error) {
      return rejectWithValue('Could not import wallet')
    }
  }
)

export const addWatchedWallet = createAppAsyncThunk(
  'cryptoWallets/addWatchedWallet',
  async (
    data: {
      label: string
      blockchain: string
      publicAddress: string
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const walletsDatastore =
        await AccountManager.getInstance().context?.openDatastore(
          VAULT_SCHEMA_WALLETS_0_2_0
        )

      if (!walletsDatastore) {
        throw new Error('Cannot get wallets datastore')
      }

      const wallet = {
        label: data.label,
        walletType: data.blockchain,
        address: data.publicAddress,
      }

      const savedWallet = (await walletsDatastore.save(wallet, {})) as {
        id: string
      } // FIXME: Temp, this is not optimal, should be able specified by a generic type

      if (!savedWallet) {
        throw new Error(walletsDatastore.errors)
      }

      dispatch(restoreCryptoWallets({ clearWallets: false }))
      dispatch(setSelectedCryptoWalletId(savedWallet.id))
    } catch (error) {
      return rejectWithValue('Could not add watched wallet')
    }
  }
)

export const deleteWallet = createAppAsyncThunk(
  'cryptoWallets/deleteWallet',
  async (walletId: string, { getState, rejectWithValue, dispatch }) => {
    try {
      const currentlySelectedWallet = getSelectedWalletId(getState())
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          VAULT_SCHEMA_WALLETS_0_2_0
        )
      // save to verida store
      await walletDb?.delete(walletId)

      // update redux store
      const updatedWalletsList = { ...getAllWallets(getState()) }
      delete updatedWalletsList[walletId]
      dispatch(saveCryptoWallets(updatedWalletsList))

      if (currentlySelectedWallet === walletId) {
        const nextWalletId = Object.keys(updatedWalletsList)[0]
        dispatch(setSelectedCryptoWalletId(nextWalletId))
      }

      dispatch(restoreCryptoWallets({ clearWallets: false }))
    } catch (error) {
      return rejectWithValue('Could not delete wallet')
    }
  }
)

export const renameWallet = createAppAsyncThunk(
  'cryptoWallets/renameWallet',
  async (
    { walletId, data }: { walletId: string; data: { name: string } },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          VAULT_SCHEMA_WALLETS_0_2_0
        )

      const row = (await walletDb?.get(walletId, {})) as {
        id: string
        label: string
      } // FIXME: Temp, this is not optimal, should be able specified by a generic type

      row.label = data.name

      await walletDb?.save(row, {})

      dispatch(restoreCryptoWallets({ clearWallets: false }))
    } catch (error) {
      return rejectWithValue('Could not rename wallet')
    }
  }
)

export const restoreCryptoWallets = createAppAsyncThunk(
  'cryptoWallets/restoreCryptoWallets',
  async (
    { clearWallets }: { clearWallets: boolean },
    { getState, dispatch }
  ) => {
    const currentlySelectedWalletId = getSelectedWalletId(getState())

    if (clearWallets) {
      dispatch(clearCryptoWallets())
    }

    const { selectedWalletId, wallets } =
      await WalletManager.restoreCryptoWallets(currentlySelectedWalletId)

    dispatch(saveCryptoWallets(wallets))
    dispatch(setSelectedCryptoWalletId(selectedWalletId))
  }
)

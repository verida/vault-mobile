import {
  getAllWallets,
  getSelectedWalletId,
  getWalletsData,
} from 'features/wallets'
import * as SecureStore from 'helpers/VeridaSecureStore'
import { WALLET_SCHEMA_0_2_0_URI } from 'wallet/constants'
import dataHelper from 'wallet/data'

import AccountManager from 'api/AccountManager'
import { BlockchainWallet } from 'api/types'
import { WalletManager } from 'api/Wallet/WalletManager'
import CONFIG from 'config/environment'
import { navigate } from 'navigation/RootNavigator'
import { createAppAsyncThunk, RootState } from 'reduxStore/types'

import { walletsSlice } from './walletsSlice'

export const { saveUserWallets, setSelectedWallet, removeUserWallets } =
  walletsSlice.actions

export const getTransactionParams = createAppAsyncThunk(
  'wallets/getTransactionParams',
  async (transactionData, { getState, rejectWithValue }) => {
    // dispatch({ type: TRANSACTION_PARAMS_FETCH_START })
    const wallets = getWalletsData(getState() as RootState)
    const params = await dataHelper.getTransactionParams(
      transactionData,
      wallets
    )

    if (params) {
      // dispatch({
      //   type: FETCHED_TRANSACTION_PARAMS,
      //   data: params,
      // })

      // fulfillWithValue(params)
      navigate('ConfirmTransaction', transactionData)
      return params
    } else {
      // dispatch({
      //   type: TRANSACTION_PARAMS_FETCH_FAILED,
      //   error: "Couldn't load params",
      // })
      rejectWithValue("Couldn't load params")
    }
  }
)

export const sendTransaction = createAppAsyncThunk(
  'wallets/sendTransaction',
  async (
    { transactionData, isAssetEnablingTransaction }: any,
    { getState, rejectWithValue }
  ) => {
    // dispatch({ type: SEND_TRANSACTION_START })
    const state = getState()

    try {
      const txData = await dataHelper.sendTransaction(
        transactionData,
        isAssetEnablingTransaction,
        state
      )
      // dispatch({
      //   type: SEND_TRANSACTION_SUCCESS,
      //   data: txData,
      // })

      // dispatch({
      //   type: ADD_PENDING_TRANSACTION,
      //   data: txData,
      // })

      if (!isAssetEnablingTransaction) {
        navigate('TransactionSuccess', undefined)
      }

      return txData
    } catch (error: any) {
      // dispatch({
      //   type: SEND_TRANSACTION_FAILED,
      //   error: error.message,
      // })
      rejectWithValue('Could not create wallet')

      if (!isAssetEnablingTransaction) {
        navigate('TransactionFailure', undefined)
      }
    }
  }
)

// These first
export const createNewWallet = createAppAsyncThunk(
  'wallets/createNewWallet',
  async (
    data: { phrase: string; name: string },
    { rejectWithValue, dispatch }
  ) => {
    // dispatch({ type: WALLET_PROCESSING_START })

    try {
      const { selectedWallet, wallets } = await WalletManager.createNewWallet(
        data.phrase,
        data.name
      )

      if (wallets) {
        dispatch(saveUserWallets(wallets))
        dispatch(setSelectedWallet(selectedWallet._id))

        // save to the storage..
        await Promise.all([
          SecureStore.setItemAsync(
            CONFIG.WALLETS_STORAGE_KEY,
            JSON.stringify(wallets)
          ),
          SecureStore.setItemAsync(
            CONFIG.SELECTED_WALLET_STORAGE_KEY,
            selectedWallet._id
          ),
        ])
      }

      // dispatch({ type: WALLET_PROCESSING_FINISHED })
    } catch (error: any) {
      // dispatch({
      //   type: WALLET_PROCESSING_FAILED,
      //   error: error,
      // })
      rejectWithValue('Could not create wallet')
    }
  }
)

export const importWallet = createAppAsyncThunk(
  'wallets/importWallet',
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

      console.log('importWallet', data)

      // save mnemonic to verida store
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          WALLET_SCHEMA_0_2_0_URI
        )

      const wallet: Partial<BlockchainWallet> = {
        walletType,
        label: data.name,
      }
      if (mnemonic) wallet.mnemonic = mnemonic
      if (privateKey) wallet.privateKey = privateKey
      const saved = (await walletDb?.save(wallet, {})) as { id: string } // FIXME: Temp, this is not optimal, should be able specified by a generic type

      const walletId = saved?.id

      // Fully update wallets data
      await AccountManager.getInstance().restoreUserWallet(false)
      dispatch(setSelectedWallet(walletId))
    } catch (error) {
      rejectWithValue('Could not import wallet')
    }
  }
)

export const addWatchedWallet = createAppAsyncThunk(
  'wallets/addWatchedWallet',
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
          WALLET_SCHEMA_0_2_0_URI
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

      // Fully update wallets data
      await AccountManager.getInstance().restoreUserWallet(false)
      dispatch(setSelectedWallet(savedWallet.id))
    } catch (error) {
      rejectWithValue('Could not add watched wallet')
    }
  }
)

export const deleteWallet = createAppAsyncThunk(
  'wallets/deleteWallet',
  async (walletId: string, { getState, rejectWithValue, dispatch }) => {
    try {
      const currentlySelectedWallet = getSelectedWalletId(getState())
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          WALLET_SCHEMA_0_2_0_URI
        )
      // save to verida store
      await walletDb?.delete(walletId)

      // update redux store
      const updatedWalletsList = { ...getAllWallets(getState()) }
      delete updatedWalletsList[walletId]
      dispatch(saveUserWallets(updatedWalletsList))

      if (currentlySelectedWallet === walletId) {
        const nextWalletId = Object.keys(updatedWalletsList)[0]
        dispatch(setSelectedWallet(nextWalletId))
      }

      // Fully update wallets data
      await AccountManager.getInstance().restoreUserWallet(false)
    } catch (error) {
      rejectWithValue('Could not delete wallet')
    }
  }
)

export const renameWallet = createAppAsyncThunk(
  'wallets/renameWallet',
  async (
    { walletId, data }: { walletId: string; data: { name: string } },
    { rejectWithValue }
  ) => {
    try {
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          WALLET_SCHEMA_0_2_0_URI
        )

      const row = (await walletDb?.get(walletId, {})) as {
        id: string
        label: string
      } // FIXME: Temp, this is not optimal, should be able specified by a generic type

      row.label = data.name

      await walletDb?.save(row, {})

      //Fully update wallets data
      await AccountManager.getInstance().restoreUserWallet(false)
    } catch (error) {
      rejectWithValue('Could not rename wallet')
    }
  }
)

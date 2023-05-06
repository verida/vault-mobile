import * as SecureStore from 'helpers/VeridaSecureStore'
import { WALLET_SCHEMA_0_2_0_URI } from 'wallet/constants'
import dataHelper from 'wallet/data'
import {
  getWalletAddressForAsset,
  rawDataToReduxState,
} from 'wallet/helpers/tokens'

import AccountManager from 'api/AccountManager'
import { WalletManager } from 'api/Wallet/WalletManager'
import CONFIG from 'config/environment'
import { navigate } from 'navigation/RootNavigator'
import { selectChains } from 'reduxStore/tokens/selectors'
import {
  getSelectedWalletId,
  getWalletList,
  getWalletsData,
} from 'reduxStore/wallet/selectors'

import { walletProviderApi } from '../../api/Wallet/WalletProvider'
import {
  ADD_PENDING_TRANSACTION,
  BALANCES_FETCH_FAILED,
  BALANCES_FETCH_START,
  FETCHED_BALANCES,
  FETCHED_TRANSACTION_DETAIL,
  FETCHED_TRANSACTION_PARAMS,
  FETCHED_TRANSACTIONS,
  REMOVE_USER_WALLETS,
  SEND_TRANSACTION_FAILED,
  SEND_TRANSACTION_START,
  SEND_TRANSACTION_SUCCESS,
  SET_SELECTED_WALLET,
  SET_USER_WALLETS,
  TRANSACTION_DETAIL_FETCH_FAILED,
  TRANSACTION_DETAIL_FETCH_START,
  TRANSACTION_PARAMS_FETCH_FAILED,
  TRANSACTION_PARAMS_FETCH_START,
  TRANSACTIONS_FETCH_FAILED,
  TRANSACTIONS_FETCH_START,
  WALLET_PROCESSING_FAILED,
  WALLET_PROCESSING_FINISHED,
  WALLET_PROCESSING_START,
} from './types'

// @chris done
export const getBalances = () => {
  return async (dispatch, getState) => {
    dispatch({ type: BALANCES_FETCH_START })

    try {
      const wallets = getWalletsData(getState().main)
      const walletParams = Object.values(wallets).map(
        (item) => `${item.chainId}:${item.address}`
      )
      const requestParams = {
        wallet: walletParams,
      }

      const balanceData = await walletProviderApi.get(
        'balance/getBalanceByChains',
        requestParams
      )

      if (balanceData.data) {
        dispatch({
          type: FETCHED_BALANCES,
          data: balanceData.data.data.results,
        })
      } else {
        dispatch({
          type: BALANCES_FETCH_FAILED,
          error: 'error',
        })
      }
    } catch (error) {
      dispatch({
        type: BALANCES_FETCH_FAILED,
        error: 'error',
      })
    }
  }
}

// @chris done
export const getTransactionsForToken = (token) => {
  return async (dispatch, getState) => {
    dispatch({ type: TRANSACTIONS_FETCH_START })
    const wallets = getWalletsData(getState().main)

    const userAddress = getWalletAddressForAsset(token.asset, wallets)

    const transactionsData = await walletProviderApi.post('transaction/list', {
      userAddress,
      asset: token.asset,
    })

    if (transactionsData) {
      dispatch({
        type: FETCHED_TRANSACTIONS,
        data: transactionsData.data.data,
      })
    } else {
      dispatch({
        type: TRANSACTIONS_FETCH_FAILED,
        error: "Couldn'nt load transactions",
      })
    }
  }
}

// @chris done
export const getTransactionDetails = (transactionID, token) => {
  console.log('--- getTransactionDetails')
  return async (dispatch, getState) => {
    dispatch({ type: TRANSACTION_DETAIL_FETCH_START })
    const wallets = getWalletsData(getState().main)

    const userAddress = getWalletAddressForAsset(token.asset, wallets)

    const transactionsData = await walletProviderApi.post('transaction/get', {
      transactionId: transactionID,
      userAddress,
      asset: token.asset,
    })

    if (transactionsData) {
      dispatch({
        type: FETCHED_TRANSACTION_DETAIL,
        data: transactionsData.data.data,
      })
    } else {
      dispatch({
        type: TRANSACTION_DETAIL_FETCH_FAILED,
        error: "Couldn'nt load transactions",
      })
    }
  }
}

export const saveUserWallets = (wallets) => {
  return async (dispatch) => {
    dispatch({
      type: SET_USER_WALLETS,
      data: wallets,
    })
  }
}

export const removeUserWallets = () => {
  return async (dispatch) => {
    dispatch({
      type: REMOVE_USER_WALLETS,
    })
  }
}

export const setSelectedWallet = (walletId) => {
  return async (dispatch) => {
    await dispatch({
      type: SET_SELECTED_WALLET,
      data: walletId,
    })
  }
}

export const getTransactionParams = (transactionData) => {
  console.log('~~~ getTransactionParams')
  console.log(transactionData)
  return async (dispatch, getState) => {
    dispatch({ type: TRANSACTION_PARAMS_FETCH_START })
    const wallets = getWalletsData(getState().main)

    const params = await dataHelper.getTransactionParams(
      transactionData,
      wallets
    )

    console.log(params)

    if (params) {
      dispatch({
        type: FETCHED_TRANSACTION_PARAMS,
        data: params,
      })
      navigate('ConfirmTransaction', transactionData)
    } else {
      dispatch({
        type: TRANSACTION_PARAMS_FETCH_FAILED,
        error: "Couldn't load params",
      })
    }
  }
}

export const sendTransaction = (
  transactionData,
  isAssetEnablingTransaction
) => {
  return async (dispatch, getState) => {
    dispatch({ type: SEND_TRANSACTION_START })
    const state = getState().main

    try {
      const txData = await dataHelper.sendTransaction(
        transactionData,
        isAssetEnablingTransaction,
        state
      )

      dispatch({
        type: SEND_TRANSACTION_SUCCESS,
        data: txData,
      })
      dispatch({
        type: ADD_PENDING_TRANSACTION,
        data: txData,
      })
      if (!isAssetEnablingTransaction) {
        navigate('TransactionSuccess')
      }
    } catch (error) {
      dispatch({
        type: SEND_TRANSACTION_FAILED,
        error: error,
      })
      if (!isAssetEnablingTransaction) {
        navigate('TransactionFailure')
      }
    }
  }
}

export const createNewWallet = (data) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_PROCESSING_START })

    try {
      const { selectedWallet, wallets } = await WalletManager.createNewWallet(
        data.phrase,
        data.name
      )

      if (wallets) {
        await dispatch(saveUserWallets(wallets))

        await dispatch(setSelectedWallet(selectedWallet._id))

        // save to storage..
        await SecureStore.setItemAsync(
          CONFIG.WALLETS_STORAGE_KEY,
          JSON.stringify(wallets)
        )
        await SecureStore.setItemAsync(
          CONFIG.SELECTED_WALLET_STORAGE_KEY,
          selectedWallet._id
        )
      }

      dispatch({ type: WALLET_PROCESSING_FINISHED })
    } catch (error) {
      dispatch({
        type: WALLET_PROCESSING_FAILED,
        error: error,
      })
    }
  }
}

export const importWallet = (data) => {
  return async (dispatch) => {
    dispatch({ type: WALLET_PROCESSING_START })

    try {
      const mnemonic = data.inputSwitch === 'seedPhrase' ? data.phrase : null
      const privateKey =
        data.inputSwitch === 'privateKey' ? data.privateKey : null
      const walletType = data.walletType

      // save mnemonic to verida store
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          WALLET_SCHEMA_0_2_0_URI
        )

      const wallet = {
        walletType,
        label: data.name,
      }
      if (mnemonic) wallet.mnemonic = mnemonic
      if (privateKey) wallet.privateKey = privateKey
      const saved = await walletDb?.save(wallet)
      const walletId = saved?.id
      AccountManager.getInstance().restoreUserWallet()
      await dispatch(setSelectedWallet(walletId))

      dispatch({ type: WALLET_PROCESSING_FINISHED })
    } catch (error) {
      dispatch({
        type: WALLET_PROCESSING_FAILED,
        error: error,
      })
    }
  }
}

export const addWatchedWallet = (data) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_PROCESSING_START })
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

      const savedWallet = await walletsDatastore.save(wallet)
      if (!savedWallet) {
        throw new Error(walletsDatastore.errors)
      }

      AccountManager.getInstance().restoreUserWallet()
      await dispatch(setSelectedWallet(savedWallet.id))

      dispatch({ type: WALLET_PROCESSING_FINISHED })
    } catch (error) {
      dispatch({
        type: WALLET_PROCESSING_FAILED,
        error: error,
      })
    }
  }
}

export const deleteWallet = (walletId) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_PROCESSING_START })

    try {
      const currentlySelectedWallet = getSelectedWalletId(getState().main)

      // save mnemonic to verida store
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          WALLET_SCHEMA_0_2_0_URI
        )

      await walletDb?.delete(walletId)

      if (currentlySelectedWallet === walletId) {
        const wallets = getWalletList(getState().main)
        const nextWalletId = Object.keys(wallets)[0]
        await dispatch(setSelectedWallet(nextWalletId))
      }

      AccountManager.getInstance().restoreUserWallet()
      dispatch({ type: WALLET_PROCESSING_FINISHED })
    } catch (error) {
      dispatch({
        type: WALLET_PROCESSING_FAILED,
        error: error,
      })
    }
  }
}

export const renameWallet = (walletId, data) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_PROCESSING_START })

    try {
      // save mnemonic to verida store
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          WALLET_SCHEMA_0_2_0_URI
        )

      const row = await walletDb?.get(walletId)

      row.label = data.name

      await walletDb.save(row)

      const hdWallets = await walletDb?.getMany()

      if (hdWallets) {
        const chains = selectChains(getState())
        const wallets = rawDataToReduxState(hdWallets, chains)

        await dispatch(saveUserWallets(wallets))
        await SecureStore.setItemAsync(
          CONFIG.WALLETS_STORAGE_KEY,
          JSON.stringify(wallets)
        )
      }

      dispatch({ type: WALLET_PROCESSING_FINISHED })
    } catch (error) {
      dispatch({
        type: WALLET_PROCESSING_FAILED,
        error: error,
      })
    }
  }
}

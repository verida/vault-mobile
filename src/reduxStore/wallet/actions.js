import * as SecureStore from 'expo-secure-store'
import dataHelper from 'wallet/data'
import { walletProviderApi } from 'wallet/helpers/api'
import multiChainWallet from 'wallet/helpers/multiChainWallet'
import {
  getWalletAddressForAsset,
  rawDataToReduxState,
} from 'wallet/helpers/tokens'

import AccountManager, {
  SELECTED_WALLET_STORAGE_KEY,
  WALLETS_STORAGE_KEY,
} from 'api/AccountManager'
import { navigate } from 'navigation/RootNavigator'
import { selectChains } from 'reduxStore/tokens/selectors'
import {
  getAllWallets,
  getSelectedWalletId,
  getWalletsData,
} from 'reduxStore/wallet/selectors'

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

export const getBalances = () => {
  return async (dispatch, getState) => {
    dispatch({ type: BALANCES_FETCH_START })

    try {
      const wallets = getWalletsData(getState().main)
      const chains = selectChains(getState())
      const requestBody = Object.values(chains)
        .filter((chain) => wallets[chain.addressMapping])
        .map((chain) => {
          return {
            address: wallets[chain.addressMapping].address,
            chainId: chain.data,
          }
        })

      const balanceData = await walletProviderApi.post(
        'balance/getBalanceByChains',
        {
          accounts: requestBody,
        }
      )

      if (balanceData.data) {
        dispatch({ type: FETCHED_BALANCES, data: balanceData.data.data })
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

export const getTransactionsForToken = (token) => {
  return async (dispatch, getState) => {
    dispatch({ type: TRANSACTIONS_FETCH_START })
    const wallets = getWalletsData(getState().main)
    const userAddress = getWalletAddressForAsset(token.addressMapping, wallets)

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

export const getTransactionDetails = (transactionID, token) => {
  return async (dispatch, getState) => {
    dispatch({ type: TRANSACTION_DETAIL_FETCH_START })
    const wallets = getWalletsData(getState().main)
    const userAddress = getWalletAddressForAsset(token.addressMapping, wallets)

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
  return async (dispatch, getState) => {
    dispatch({ type: TRANSACTION_PARAMS_FETCH_START })
    const wallets = getWalletsData(getState().main)

    const params = await dataHelper.getTransactionParams(
      transactionData,
      wallets
    )

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
      const userHDWalletMnemonic = data.phrase
        ? data.phrase
        : multiChainWallet.generateMnemonic()

      // save mnemonic to verida store
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          'https://vault.schemas.verida.io/wallets/v0.2.0/schema.json'
        )

      const currentWalletsData = getAllWallets(getState().main)

      const wallet = {
        mnemonic: userHDWalletMnemonic,
        walletType: 'multi',
        label: data
          ? data.name
          : 'Multi Coin Wallet ' + (Object.keys(currentWalletsData).length + 1),
      }
      const saved = await walletDb?.save(wallet)
      const walletID = saved?.id

      const hdWallets = await walletDb?.getMany()

      if (hdWallets) {
        const chains = selectChains(getState())
        const wallets = rawDataToReduxState(hdWallets, chains)

        await dispatch(saveUserWallets(wallets))

        await dispatch(setSelectedWallet(walletID))

        // save to storage..
        await SecureStore.setItemAsync(
          WALLETS_STORAGE_KEY,
          JSON.stringify(wallets)
        )
        await SecureStore.setItemAsync(SELECTED_WALLET_STORAGE_KEY, walletID)
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
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_PROCESSING_START })

    try {
      const mnemonic = data.inputSwitch === 'seedPhrase' ? data.phrase : null
      const privateKey =
        data.inputSwitch === 'privateKey' ? data.privateKey : null
      const walletType = data.blockchain

      // save mnemonic to verida store
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          'https://vault.schemas.verida.io/wallets/v0.2.0/schema.json'
        )

      const wallet = {
        walletType,
        label: data.name,
      }
      if (mnemonic) wallet.mnemonic = mnemonic
      if (privateKey) wallet.privateKey = privateKey
      const saved = await walletDb?.save(wallet)
      const walletID = saved?.id

      const hdWallets = await walletDb?.getMany()

      if (hdWallets) {
        const chains = selectChains(getState())
        const wallets = rawDataToReduxState(hdWallets, chains)

        await dispatch(saveUserWallets(wallets))

        await dispatch(setSelectedWallet(walletID))

        // save to storage..
        await SecureStore.setItemAsync(
          WALLETS_STORAGE_KEY,
          JSON.stringify(wallets)
        )
        await SecureStore.setItemAsync(SELECTED_WALLET_STORAGE_KEY, walletID)
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

export const deleteWallet = (walletId) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_PROCESSING_START })

    try {
      const currentlySelectedWallet = getSelectedWalletId(getState().main)

      // save mnemonic to verida store
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          'https://vault.schemas.verida.io/wallets/v0.2.0/schema.json'
        )

      await walletDb?.delete(walletId)

      const hdWallets = await walletDb?.getMany()

      if (hdWallets) {
        const chains = selectChains(getState())
        const wallets = rawDataToReduxState(hdWallets, chains)

        if (currentlySelectedWallet === walletId) {
          let firstWalletId = hdWallets[0]._id
          await dispatch(setSelectedWallet(firstWalletId))
          await SecureStore.setItemAsync(
            SELECTED_WALLET_STORAGE_KEY,
            firstWalletId
          )
        }

        await dispatch(saveUserWallets(wallets))
        await SecureStore.setItemAsync(
          WALLETS_STORAGE_KEY,
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

export const renameWallet = (walletId, data) => {
  return async (dispatch, getState) => {
    dispatch({ type: WALLET_PROCESSING_START })

    try {
      // save mnemonic to verida store
      const walletDb =
        await AccountManager.getInstance().context?.openDatastore(
          'https://vault.schemas.verida.io/wallets/v0.2.0/schema.json'
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
          WALLETS_STORAGE_KEY,
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

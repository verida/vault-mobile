import { SUPPORTED_TOKENS_SYMBOLS } from 'wallet/constants'
import dataHelper from 'wallet/data'
import { pricingApi } from 'wallet/helpers/api'

import { navigate } from 'navigation/RootNavigator'
import { getWalletsData } from 'reduxStore/wallet/selectors'

import {
  ADD_PENDING_TRANSACTION,
  BALANCES_FETCH_FAILED,
  BALANCES_FETCH_START,
  CURRENCIES_FETCH_FAILED,
  CURRENCIES_FETCH_START,
  FETCHED_BALANCES,
  FETCHED_CURRENCIES,
  FETCHED_TRANSACTION_DETAIL,
  FETCHED_TRANSACTION_PARAMS,
  FETCHED_TRANSACTIONS,
  REMOVE_USER_WALLETS,
  SEND_TRANSACTION_FAILED,
  SEND_TRANSACTION_START,
  SEND_TRANSACTION_SUCCESS,
  SET_USER_WALLETS,
  TRANSACTION_DETAIL_FETCH_FAILED,
  TRANSACTION_DETAIL_FETCH_START,
  TRANSACTION_PARAMS_FETCH_FAILED,
  TRANSACTION_PARAMS_FETCH_START,
  TRANSACTIONS_FETCH_FAILED,
  TRANSACTIONS_FETCH_START,
} from './types'

export const getPrices = () => {
  return (dispatch) => {
    dispatch({ type: CURRENCIES_FETCH_START })
    pricingApi
      .get('cryptocurrency/quotes/latest', {
        symbol: SUPPORTED_TOKENS_SYMBOLS,
      })
      .then((response) => {
        if (response.ok) {
          if (response.data) {
            dispatch({ type: FETCHED_CURRENCIES, data: response.data.data })
          } else {
            dispatch({
              type: CURRENCIES_FETCH_FAILED,
              error: "Couldn'nt load currencies",
            })
          }
        } else {
          const err = response.status === 404 ? 'API error.' : response.problem
          dispatch({ type: CURRENCIES_FETCH_FAILED, error: err })
        }
      })
  }
}

export const getBalances = () => {
  return async (dispatch, getState) => {
    dispatch({ type: BALANCES_FETCH_START })

    try {
      const wallets = getWalletsData(getState())

      let balanceData = await dataHelper.getAllBalances(wallets)

      if (balanceData) {
        dispatch({ type: FETCHED_BALANCES, data: balanceData })
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

export const getTransactionsForToken = (assetID) => {
  return async (dispatch, getState) => {
    dispatch({ type: TRANSACTIONS_FETCH_START })
    const wallets = getWalletsData(getState())
    const transactionsData = await dataHelper.getTransactions(wallets, assetID)

    if (transactionsData) {
      dispatch({
        type: FETCHED_TRANSACTIONS,
        data: transactionsData,
      })
    } else {
      dispatch({
        type: TRANSACTIONS_FETCH_FAILED,
        error: "Couldn'nt load transactions",
      })
    }
  }
}

export const getTransactionDetails = (transactionID, tokenAddress) => {
  return async (dispatch, getState) => {
    dispatch({ type: TRANSACTION_DETAIL_FETCH_START })
    const wallets = getWalletsData(getState())

    let transactionData = await dataHelper.getTransactionDetails(
      transactionID,
      tokenAddress,
      wallets
    )

    if (transactionData) {
      dispatch({
        type: FETCHED_TRANSACTION_DETAIL,
        data: transactionData,
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

export const getTransactionParams = (transactionData) => {
  return async (dispatch, getState) => {
    dispatch({ type: TRANSACTION_PARAMS_FETCH_START })
    const wallets = getWalletsData(getState())

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
    const state = getState()

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

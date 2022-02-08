import algosdk from 'algosdk'

import { pricingApi } from 'wallet/helpers/api'
import { algodClient, indexerClient } from 'wallet/chains/algorand'
import dataHelper from 'wallet/data'
import {
  getWalletsData,
  getTransactionParamsData,
} from 'reduxStore/wallet/selectors'
import { isNativeToken, getTokenAddress } from 'wallet/helpers/tokens'
import { navigate } from 'navigation/RootNavigator'

import {
  FETCHED_CURRENCIES,
  CURRENCIES_FETCH_FAILED,
  CURRENCIES_FETCH_START,
  FETCHED_BALANCES,
  BALANCES_FETCH_START,
  BALANCES_FETCH_FAILED,
  FETCHED_TRANSACTIONS,
  TRANSACTIONS_FETCH_START,
  TRANSACTIONS_FETCH_FAILED,
  SET_USER_WALLETS,
  REMOVE_USER_WALLETS,
  TRANSACTION_PARAMS_FETCH_START,
  TRANSACTION_PARAMS_FETCH_FAILED,
  FETCHED_TRANSACTION_PARAMS,
  SEND_TRANSACTION_START,
  SEND_TRANSACTION_SUCCESS,
  SEND_TRANSACTION_FAILED,
  TRANSACTION_DETAIL_FETCH_START,
  TRANSACTION_DETAIL_FETCH_FAILED,
  FETCHED_TRANSACTION_DETAIL,
  ADD_PENDING_TRANSACTION,
} from './types'

import { SUPPORTED_TOKENS, SUPPORTED_TOKENS_SYMBOLS } from 'wallet/constants'

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

export const getTransactionDetails = (transactionID) => {
  return async (dispatch) => {
    dispatch({ type: TRANSACTION_DETAIL_FETCH_START })

    let transactionData = await indexerClient
      .lookupTransactionByID(transactionID)
      .do()

    if (transactionData) {
      dispatch({
        type: FETCHED_TRANSACTION_DETAIL,
        data: transactionData.transaction,
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
  return async (dispatch) => {
    dispatch({ type: TRANSACTION_PARAMS_FETCH_START })

    const params = await algodClient.getTransactionParams().do()

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

    const wallets = getWalletsData(getState())
    let transactionParams
    if (isAssetEnablingTransaction) {
      transactionParams = await algodClient.getTransactionParams().do()
    } else {
      transactionParams = getTransactionParamsData(getState())
    }
    let isNative = isNativeToken(transactionData.token.address)
    let tokenAddress = getTokenAddress(transactionData.token.address)

    let transaction

    if (isNative) {
      transaction = algosdk.makePaymentTxnWithSuggestedParams(
        wallets.algo.address,
        transactionData.address,
        transactionData.amount * Math.pow(10, transactionData.token.decimal),
        undefined,
        undefined,
        transactionParams
      )
    } else {
      transaction = algosdk.makeAssetTransferTxnWithSuggestedParams(
        wallets.algo.address,
        isAssetEnablingTransaction
          ? wallets.algo.address
          : transactionData.address,
        undefined,
        undefined,
        isAssetEnablingTransaction
          ? 0
          : transactionData.amount *
              Math.pow(10, transactionData.token.decimal),
        undefined,
        parseInt(tokenAddress, 10),
        transactionParams
      )
    }

    const privateKey = wallets.algo.privateKey

    const secretKey = Buffer.from(
      privateKey.substring(2, privateKey.length),
      'hex'
    ).toJSON().data

    const mnemonic = algosdk.secretKeyToMnemonic(secretKey)
    const wallet = algosdk.mnemonicToSecretKey(mnemonic)

    const signedTransaction = transaction.signTxn(wallet.sk)

    try {
      const sent = await algodClient.sendRawTransaction(signedTransaction).do()

      const txData = {
        id: sent.txId,
        amount: transaction.amount,
        fee: transaction.fee,
        to: transactionData.address,
        from: wallets.algo.address,
        token: transactionData.token,
        feeSymbol: SUPPORTED_TOKENS[0].symbol,
      }

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

import algosdk from 'algosdk'
import { pricingApi } from 'helpers/api'
import { getTokenAddress, isNativeToken } from 'helpers/tokens'
import { SUPPORTED_TOKENS, SUPPORTED_TOKENS_SYMBOLS } from 'wallet/constants'

import { navigate } from 'navigation/RootNavigator'
import {
  getTransactionParamsData,
  getWalletsData,
} from 'reduxStore/wallet/selectors'

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

const token = {
  'X-API-key': 'pMDXUFVkGJ7TFkkdORaV84pJEvUOBAvD1w9LTkq6',
}
const baseServer = 'https://testnet-algorand.api.purestake.io/idx2'
const port = ''
const algodServer = 'https://testnet-algorand.api.purestake.io/ps2'
const algodPort = ''

const indexerClient = new algosdk.Indexer(token, baseServer, port)
const algodClient = new algosdk.Algodv2(token, algodServer, algodPort)

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

      let accountInfo = await indexerClient
        .lookupAccountByID(wallets.algo.address)
        .do()

      if (accountInfo && !accountInfo.message) {
        dispatch({ type: FETCHED_BALANCES, data: accountInfo.account })
      } else {
        dispatch({
          type: BALANCES_FETCH_FAILED,
          error: accountInfo.message,
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
    const tokenAddress = getTokenAddress(assetID)
    const isNative = isNativeToken(assetID)

    let transactionsData = await indexerClient
      .searchForTransactions()
      .address(wallets.algo.address)
      .assetID(isNative ? null : tokenAddress)
      .txType(isNative ? 'pay' : null)
      .do()

    if (transactionsData) {
      dispatch({
        type: FETCHED_TRANSACTIONS,
        data: transactionsData.transactions,
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
        transactionData.amount * 1000000,
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
        isAssetEnablingTransaction ? 0 : transactionData.amount * 1000000,
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

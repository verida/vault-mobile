import algosdk from 'algosdk'

import { pricingApi, chainsApi } from 'helpers/api'
import {
  getWalletsData,
  getTransactionParamsData,
} from 'reduxStore/wallet/selectors'
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
  TRANSACTION_PARAMS_FETCH_START,
  TRANSACTION_PARAMS_FETCH_FAILED,
  FETCHED_TRANSACTION_PARAMS,
  SEND_TRANSACTION_START,
  SEND_TRANSACTION_SUCCESS,
  SEND_TRANSACTION_FAILED,
  TRANSACTION_DETAIL_FETCH_START,
  TRANSACTION_DETAIL_FETCH_FAILED,
  FETCHED_TRANSACTION_DETAIL,
} from './types'

import { SUPPORTED_TOKENS_SYMBOLS } from 'wallet/constants'

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

    let transactionsData = await indexerClient
      .searchForTransactions()
      .address(wallets.algo.address)
      .assetID(assetID !== '1' ? assetID : null)
      .txType(assetID === '1' ? 'pay' : null)
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

export const sendTransaction = (transactionData) => {
  return async (dispatch, getState) => {
    dispatch({ type: SEND_TRANSACTION_START })

    const wallets = getWalletsData(getState())
    const transactionParams = getTransactionParamsData(getState())

    let transaction

    if (transactionData.token.address === '1') {
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
        transactionData.address,
        undefined,
        undefined,
        transactionData.amount * 1000000,
        undefined,
        parseInt(transactionData.token.address),
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
      }

      dispatch({
        type: SEND_TRANSACTION_SUCCESS,
        data: txData,
      })
      navigate('TransactionSuccess')
    } catch (error) {
      dispatch({
        type: SEND_TRANSACTION_FAILED,
        error: "Couldn't load params",
      })
      navigate('TransactionFailure')
    }
  }
}

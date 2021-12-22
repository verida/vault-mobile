import algosdk from 'algosdk'

import { pricingApi, chainsApi } from 'helpers/api'
import WalletUtils from '@verida/wallet-utils'
import AccountManager from 'api/AccountManager'
import { getWalletsData } from 'reduxStore/wallet/selectors'
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

export const getWallets = () => {
  return async (dispatch) => {
    const veridaApp = AccountManager.getInstance().context
    const datastore = await veridaApp.openDatastore(
      'https://saadibrah.im/schema/wallet.json'
    )

    const HDwallets = await datastore.getMany()
    const wallets = WalletUtils.generateHDWallets(HDwallets[0].mnemonic)
    dispatch({
      type: SET_USER_WALLETS,
      data: wallets,
    })
  }
}

export const getTransactionParams = (navParams) => {
  return async (dispatch) => {
    dispatch({ type: TRANSACTION_PARAMS_FETCH_START })

    const params = await algodClient.getTransactionParams().do()

    if (params) {
      dispatch({
        type: FETCHED_TRANSACTION_PARAMS,
        data: params,
      })
      navigate('ConfirmTransaction', navParams)
    } else {
      dispatch({
        type: TRANSACTION_PARAMS_FETCH_FAILED,
        error: "Couldn't load params",
      })
    }
  }
}

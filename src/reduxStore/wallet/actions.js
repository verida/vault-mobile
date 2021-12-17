import { pricingApi, chainsApi } from 'helpers/api'
import WalletUtils from '@verida/wallet-utils'
import AccountManager from 'api/AccountManager'
import { getWalletsData } from 'reduxStore/wallet/selectors'

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
} from './types'

import { SUPPORTED_TOKENS_SYMBOLS } from 'wallet/constants'

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
  return (dispatch, getState) => {
    dispatch({ type: BALANCES_FETCH_START })

    const wallets = getWalletsData(getState())
    chainsApi
      .get('algorand/mainnet/indexer/v2/accounts/' + wallets.algo.address)
      .then((response) => {
        console.log(response, 'getBalances')
        if (response.ok) {
          if (response.data) {
            dispatch({ type: FETCHED_BALANCES, data: response.data.account })
          } else {
            dispatch({
              type: BALANCES_FETCH_FAILED,
              error: "Couldn'nt load currencies",
            })
          }
        } else {
          const err = response.status === 404 ? 'API error.' : response.problem
          dispatch({ type: BALANCES_FETCH_FAILED, error: err })
        }
      })
  }
}

export const getTransactionsForToken = (assetID) => {
  return (dispatch, getState) => {
    dispatch({ type: TRANSACTIONS_FETCH_START })
    const wallets = getWalletsData(getState())
    chainsApi
      .get('algorand/mainnet/indexer/v2/transactions', {
        // address: 'DI2MLO726S33IHHTKM5XMTQCE3MDV23QN3KFCZZYFIUWCURLALMTETKIBE',
        // address: 'CG7CUMAJWSTIP4KPQHWIII7QEASDQTGSOYRPRJ4WX7QZ7OQDCNZPJSNLHE',
        address: wallets.algo.address,
        'asset-id': assetID !== '1' ? assetID : null,
        'tx-type': assetID === '1' ? 'pay' : null,
      })
      .then((response) => {
        console.log(response, 'getTransactionsForToken')
        if (response.ok) {
          if (response.data) {
            dispatch({
              type: FETCHED_TRANSACTIONS,
              data: response.data.transactions,
            })
          } else {
            dispatch({
              type: TRANSACTIONS_FETCH_FAILED,
              error: "Couldn'nt load currencies",
            })
          }
        } else {
          const err = response.status === 404 ? 'API error.' : response.problem
          dispatch({ type: TRANSACTIONS_FETCH_FAILED, error: err })
        }
      })
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

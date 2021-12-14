import { pricingApi, chainsApi } from 'helpers/api'

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
  return (dispatch) => {
    dispatch({ type: BALANCES_FETCH_START })
    chainsApi
      .get(
        'algorand/mainnet/indexer/v2/accounts/CG7CUMAJWSTIP4KPQHWIII7QEASDQTGSOYRPRJ4WX7QZ7OQDCNZPJSNLHE'
      )
      .then((response) => {
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
  return (dispatch) => {
    dispatch({ type: TRANSACTIONS_FETCH_START })
    chainsApi
      .get('algorand/mainnet/indexer/v2/transactions', {
        // address: 'DI2MLO726S33IHHTKM5XMTQCE3MDV23QN3KFCZZYFIUWCURLALMTETKIBE',
        address: 'CG7CUMAJWSTIP4KPQHWIII7QEASDQTGSOYRPRJ4WX7QZ7OQDCNZPJSNLHE',
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

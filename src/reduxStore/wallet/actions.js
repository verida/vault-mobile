import { pricingApi } from 'helpers/api'

import {
  FETCHED_CURRENCIES,
  CURRENCIES_FETCH_FAILED,
  CURRENCIES_FETCH_START,
} from './types'

import { SUPPORTED_TOKENS_SYMBOLS } from 'wallet/constants'

export const getCurrencies = () => {
  return (dispatch) => {
    dispatch({ type: CURRENCIES_FETCH_START })
    pricingApi
      .get('cryptocurrency/quotes/latest', {
        symbol: SUPPORTED_TOKENS_SYMBOLS,
      })
      .then((response) => {
        console.log(response, 'getCurrencies response')
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

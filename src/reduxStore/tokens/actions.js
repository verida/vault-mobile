import { walletProviderApi } from 'wallet/helpers/api'

import { selectTokensTimestamp } from './selectors'
import {
  FETCHED_TOKENS,
  TOKENS_FETCH_FAILED,
  TOKENS_FETCH_START,
} from './types'

export const getTokens = () => {
  return async (dispatch, getState) => {
    const timestamp = selectTokensTimestamp(getState())

    if (timestamp && timestamp > Date.now() - 60 * 60 * 24 * 1000) {
      return
    }

    dispatch({ type: TOKENS_FETCH_START })
    const response = await walletProviderApi.get('tokens/get')
    if (response.ok) {
      if (response.data) {
        dispatch({ type: FETCHED_TOKENS, data: response.data.data })
      } else {
        dispatch({
          type: TOKENS_FETCH_FAILED,
          error: "Couldn'nt load currencies",
        })
      }
    } else {
      const err = response.status === 404 ? 'API error.' : response.problem
      dispatch({ type: TOKENS_FETCH_FAILED, error: err })
    }
  }
}

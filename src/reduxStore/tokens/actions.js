import { AssetId } from 'caip'
import { walletProviderApi } from '../../api/Wallet/WalletProvider'
// import { selectTokensTimestamp } from './selectors'
import {
  FETCHED_TOKENS,
  TOKENS_FETCH_FAILED,
  TOKENS_FETCH_START,
} from './types'

export const getTokens = (assetIds: AssetId[]) => {
  return async (dispatch) => {
    // commenting this out till we have a decision.
    // const timestamp = selectTokensTimestamp(getState())

    // if (timestamp && timestamp > Date.now() - 60 * 60 * 24 * 1000) {
    //   return
    // }

    dispatch({ type: TOKENS_FETCH_START })
    const response = await walletProviderApi.get('tokens/getWithPrice', {
      wallet: assetId.toString()
    })
    if (response.ok) {
      if (response.data) {
        dispatch({ type: FETCHED_TOKENS, data: response.data.data })
      } else {
        dispatch({
          type: TOKENS_FETCH_FAILED,
          error: `Unable to load tokens`,
        })
      }
    } else {
      const err = response.status === 404 ? 'API error.' : response.problem
      dispatch({ type: TOKENS_FETCH_FAILED, error: err })
    }
  }
}

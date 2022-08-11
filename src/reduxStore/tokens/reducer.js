import {
  FETCHED_TOKENS,
  TOKENS_FETCH_FAILED,
  TOKENS_FETCH_START,
} from './types'

const initialState = {
  data: [],
  fetching: false,
  error: undefined,
  timeFetched: undefined,
}

export const tokensReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOKENS_FETCH_START:
      return {
        ...state,
        fetching: true,
        error: undefined,
        data: [],
        timeFetched: undefined,
      }
    case FETCHED_TOKENS:
      return {
        ...state,
        fetching: false,
        error: undefined,
        data: action.data,
        timeFetched: Date.now(),
      }
    case TOKENS_FETCH_FAILED:
      return {
        ...state,
        fetching: false,
        error: action.error,
        data: [],
        timeFetched: undefined,
      }

    default:
      return state
  }
}

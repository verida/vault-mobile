import { Reducer } from 'redux'

import { ReduxError } from 'reduxStore/types'

export type ApiErrorState = Record<string, string | ReduxError>

export const apiErrorReducer: Reducer<ApiErrorState> = (state = {}, action) => {
  const { type } = action
  const matches = /(.*)_(REQUEST|FAILURE)/.exec(type)

  // not a *_REQUEST / *_FAILURE actions, so we ignore them
  if (!matches) return state

  const [, requestName, requestState] = matches
  return {
    ...state,
    // Store errorMessage
    // e.g. stores errorMessage when receiving GET_TODOS_FAILURE
    //      else clear errorMessage when receiving GET_TODOS_REQUEST
    [requestName]: requestState === 'FAILURE' ? action.error : '',
  }
}

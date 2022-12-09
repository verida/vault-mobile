import { createSelector } from 'reselect'

import { AllActions, RootState } from 'reduxStore/types'

// Helpers for tracking API request states automatically [REQUEST, SUCCESS, FAILURE]

export const createLoadingSelector =
  (actions: AllActions['type'][]) => (state: RootState) => {
    // returns true only when all actions is not loading
    // console.log('actions', actions, state.api)
    return actions.some(
      (action) => state.api[action.replace(/(_REQUEST|_SUCCESS|_FAILURE)$/, '')]
    )
  }

export const createErrorMessageSelector =
  (actions: AllActions['type'][]) => (state: RootState) => {
    // returns the first error messages for actions
    // * We assume when any request fails on a page that
    //   requires multiple API calls, we shows the first error
    return (
      actions
        .map(
          (action) =>
            state.apiError[action.replace(/(_REQUEST|_SUCCESS|_FAILURE)$/, '')]
        )
        .filter(Boolean)[0] || ''
    )
  }

/**
 * @param actions Array of requests want to tracking status eg. ['GET_TODOS_REQUEST']
 */
export const createRequestSelector = (actions: AllActions['type'][]) =>
  createSelector(
    createLoadingSelector(actions),
    createErrorMessageSelector(actions),
    (isLoading, error) => ({
      isLoading,
      error,
    })
  )

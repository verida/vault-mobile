import { applyMiddleware, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'

import { ADD_WORD, REMOVE_WORD, RESET_PHRASE } from './words/action-types'
import {
  ADD_ACCOUNT,
  SET_ACCOUNTS,
  SET_AUTH_STATUS,
  SET_NEW_MESSAGES_COUNT,
  SET_PUBLIC_PROFILE_DATA,
  SET_SELECTED_ACCOUNT,
  SET_SHOW_SEED_PHRASE_REMINDER,
  SET_SWITCH_ACCOUNT_TOAST,
} from './general/action-types'
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
} from './wallet/types'
import update from 'immutability-helper'

const initialState = {
  template: [],
  authenticated: false,
  newMessagesCount: 0,
  publicProfileData: {
    name: '',
    country: '',
    description: '',
  },
  accounts: {},
  selectedAccount: null,
  switchAccountToast: null,
  showSeedPhraseReminder: false,
  pricing: {
    data: [],
    fetching: false,
    error: undefined,
  },
  balances: {
    data: {},
    fetching: false,
    error: undefined,
  },
  transactions: {
    data: [],
    fetching: false,
    error: undefined,
  },
  transactionParams: {
    data: {},
    fetching: false,
    error: undefined,
  },
  sentTransaction: {
    data: {},
    fetching: false,
    error: undefined,
  },
  transactionDetails: {
    data: null,
    fetching: false,
    error: undefined,
  },
  wallets: { data: {} },
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_WORD:
      if (state.template.includes(action.payload)) return state
      const template = [...state.template, action.payload]
      return { ...state, template }
    case REMOVE_WORD:
      const filtered = state.template.filter((item) => item !== action.payload)
      return { ...state, template: filtered }
    case RESET_PHRASE:
      return { ...state, template: [] }
    case SET_AUTH_STATUS:
      return { ...state, authenticated: action.payload }
    case SET_PUBLIC_PROFILE_DATA:
      return { ...state, publicProfileData: action.payload }
    case SET_NEW_MESSAGES_COUNT:
      return { ...state, newMessagesCount: action.payload }
    case SET_ACCOUNTS:
      return update(state, {
        accounts: {
          $set: action.payload,
        },
      })
    case SET_SELECTED_ACCOUNT:
      return update(state, {
        selectedAccount: {
          $set: action.payload,
        },
      })
    case ADD_ACCOUNT:
      return update(state, {
        accounts: {
          $apply: function (value) {
            return {
              ...value,
              [action.payload.did]: action.payload,
            }
          },
        },
      })
    case SET_SWITCH_ACCOUNT_TOAST:
      return update(state, {
        switchAccountToast: {
          $set: action.payload,
        },
      })

    case SET_SHOW_SEED_PHRASE_REMINDER:
      return update(state, {
        showSeedPhraseReminder: {
          $set: action.payload,
        },
      })

    case CURRENCIES_FETCH_START:
      return {
        ...state,
        pricing: { fetching: true, error: undefined, data: [] },
      }
    case FETCHED_CURRENCIES:
      return {
        ...state,
        pricing: { fetching: false, error: undefined, data: action.data },
      }
    case CURRENCIES_FETCH_FAILED:
      return {
        ...state,
        pricing: { fetching: false, error: action.error, data: [] },
      }

    case BALANCES_FETCH_START:
      return {
        ...state,
        balances: { fetching: true, error: undefined, data: {} },
      }
    case FETCHED_BALANCES:
      return {
        ...state,
        balances: { fetching: false, error: undefined, data: action.data },
      }
    case BALANCES_FETCH_FAILED:
      return {
        ...state,
        balances: { fetching: false, error: action.error, data: {} },
      }

    case TRANSACTIONS_FETCH_START:
      return {
        ...state,
        transactions: { fetching: true, error: undefined, data: [] },
      }
    case FETCHED_TRANSACTIONS:
      return {
        ...state,
        transactions: { fetching: false, error: undefined, data: action.data },
      }
    case TRANSACTIONS_FETCH_FAILED:
      return {
        ...state,
        transactions: { fetching: false, error: action.error, data: [] },
      }

    case TRANSACTION_PARAMS_FETCH_START:
      return {
        ...state,
        transactionParams: { fetching: true, error: undefined, data: {} },
      }
    case FETCHED_TRANSACTION_PARAMS:
      return {
        ...state,
        transactionParams: {
          fetching: false,
          error: undefined,
          data: action.data,
        },
      }
    case TRANSACTION_PARAMS_FETCH_FAILED:
      return {
        ...state,
        transactions: { fetching: false, error: action.error, data: {} },
      }

    case SEND_TRANSACTION_START:
      return {
        ...state,
        sentTransaction: { fetching: true, error: undefined, data: {} },
      }
    case SEND_TRANSACTION_SUCCESS:
      return {
        ...state,
        sentTransaction: {
          fetching: false,
          error: undefined,
          data: action.data,
        },
      }
    case SEND_TRANSACTION_FAILED:
      return {
        ...state,
        sentTransaction: { fetching: false, error: action.error, data: {} },
      }

    case TRANSACTION_DETAIL_FETCH_START:
      return {
        ...state,
        transactionDetails: { fetching: true, error: undefined, data: null },
      }
    case FETCHED_TRANSACTION_DETAIL:
      return {
        ...state,
        transactionDetails: {
          fetching: false,
          error: undefined,
          data: action.data,
        },
      }
    case TRANSACTION_DETAIL_FETCH_FAILED:
      return {
        ...state,
        transactionDetails: {
          fetching: false,
          error: action.error,
          data: null,
        },
      }

    case SET_USER_WALLETS:
      return {
        ...state,
        wallets: { data: action.data },
      }

    default:
      return state
  }
}

const composeEnhancers = composeWithDevTools({
  // Specify here name, actionsBlacklist, actionsCreators and other options
})

const middleware = [thunk]

export default createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(...middleware)
    // other store enhancers if any
  )
)

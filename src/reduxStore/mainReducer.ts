import update from 'immutability-helper'
import { cloneDeep } from 'lodash'

import {
  ADD_ACCOUNT,
  LOG_OUT,
  SET_ACCOUNTS,
  SET_AUTH_STATUS,
  SET_NAVIGATION_LINK,
  SET_NEW_MESSAGES_COUNT,
  SET_PUBLIC_PROFILE_DATA,
  SET_SELECTED_ACCOUNT,
  SET_SHOW_SEED_PHRASE_REMINDER,
  SET_SWITCH_ACCOUNT_TOAST,
} from './general/action-types'
import {
  ADD_PENDING_TRANSACTION,
  FETCHED_TRANSACTION_PARAMS,
  REMOVE_USER_WALLETS,
  SEND_TRANSACTION_FAILED,
  SEND_TRANSACTION_START,
  SEND_TRANSACTION_SUCCESS,
  SET_SELECTED_WALLET,
  SET_USER_WALLETS,
  TRANSACTION_PARAMS_FETCH_FAILED,
  TRANSACTION_PARAMS_FETCH_START,
  WALLET_PROCESSING_FAILED,
  WALLET_PROCESSING_FINISHED,
  WALLET_PROCESSING_START,
} from './wallet/types'
import { ADD_WORD, REMOVE_WORD, RESET_PHRASE } from './words/action-types'

const walletInitialState = {
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
  pendingTransactions: {
    data: [],
  },
  wallets: { data: {} },
  selectedWallet: null,
  walletProcessing: {
    loading: false,
    error: undefined,
  },
}

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
  ...walletInitialState,
  navigationLink: null,
}

export const mainReducer = (state = initialState, action) => {
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
          $set: cloneDeep(action.payload),
        },
      })
    case SET_SELECTED_ACCOUNT:
      return update(state, {
        selectedAccount: {
          $set: cloneDeep(action.payload),
        },
      })
    case ADD_ACCOUNT:
      return update(state, {
        accounts: {
          $apply: function (value) {
            return {
              ...value,
              [action.payload.did]: cloneDeep(action.payload),
            }
          },
        },
      })
    case SET_SWITCH_ACCOUNT_TOAST:
      return update(state, {
        switchAccountToast: {
          $set: cloneDeep(action.payload),
        },
      })

    case SET_SHOW_SEED_PHRASE_REMINDER:
      return update(state, {
        showSeedPhraseReminder: {
          $set: cloneDeep(action.payload),
        },
      })

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
        transactions: { fetching: false, error: action.error, data: [] },
      }

    case SEND_TRANSACTION_START:
      return {
        ...state,
        sentTransaction: { fetching: true, error: undefined, data: {} },
      }
    case SEND_TRANSACTION_SUCCESS:
      action.data.amount = action.data.amount.toHexString()

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

    case ADD_PENDING_TRANSACTION:
      return {
        ...state,
        pendingTransactions: {
          data: [action.data, ...state.pendingTransactions.data],
        },
      }

    case SET_USER_WALLETS:
      return {
        ...state,
        wallets: { data: action.data },
      }

    case SET_SELECTED_WALLET:
      return {
        ...state,
        selectedWallet: action.data,
      }

    case REMOVE_USER_WALLETS:
      return {
        ...state,
        ...walletInitialState,
      }

    case WALLET_PROCESSING_START:
      return {
        ...state,
        walletProcessing: {
          loading: true,
          error: undefined,
        },
      }

    case WALLET_PROCESSING_FAILED:
      return {
        ...state,
        walletProcessing: {
          loading: false,
          error: action.error,
        },
      }

    case WALLET_PROCESSING_FINISHED:
      return {
        ...state,
        walletProcessing: {
          loading: false,
          error: undefined,
        },
      }

    case SET_NAVIGATION_LINK:
      return update(state, {
        navigationLink: {
          $set: action.payload,
        },
      })

    case LOG_OUT:
      return update(state, {
        newMessagesCount: {
          $set: 0,
        },
        publicProfileData: {
          $set: {
            name: '',
            country: '',
            description: '',
          },
        },
      })

    default:
      return state
  }
}

import update from 'immutability-helper'

import {
  ADD_ACCOUNT,
  LOG_OUT,
  SET_ACCOUNTS,
  SET_AUTH_STATUS,
  SET_COUNTRIES,
  SET_NAVIGATION_LINK,
  SET_NETWORKS,
  SET_NEW_MESSAGES_COUNT,
  SET_PUBLIC_PROFILE_DATA,
  SET_SELECTED_ACCOUNT,
  SET_SHOW_SEED_PHRASE_REMINDER,
  SET_SWITCH_ACCOUNT_TOAST,
} from './general/action-types'
import { ADD_WORD, REMOVE_WORD, RESET_PHRASE } from './words/action-types'

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
  networks: [],
  countries: [],
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

    case SET_NETWORKS:
      return update(state, {
        networks: {
          $set: action.payload,
        },
      })

    case SET_NAVIGATION_LINK:
      return update(state, {
        navigationLink: {
          $set: action.payload,
        },
      })

    case SET_COUNTRIES:
      return update(state, {
        countries: {
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

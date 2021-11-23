import {
  ADD_ACCOUNT,
  SET_ACCOUNTS,
  SET_AUTH_STATUS,
  SET_INBOX_ITEMS,
  SET_NEW_MESSAGES_COUNT,
  SET_PUBLIC_PROFILE_DATA,
  SET_SELECTED_ACCOUNT,
  SET_SHOW_SEED_PHRASE_REMINDER,
  SET_SWITCH_ACCOUNT_TOAST,
} from './action-types'

export const setAuthStatus = (payload) => {
  return { type: SET_AUTH_STATUS, payload }
}

export const setPublicProfileData = (payload) => {
  return { type: SET_PUBLIC_PROFILE_DATA, payload }
}

export const setNewMessagesCount = (payload) => {
  return { type: SET_NEW_MESSAGES_COUNT, payload }
}

export const setInboxItems = (payload) => {
  return { type: SET_INBOX_ITEMS, payload }
}

export const setAccounts = (payload) => {
  return { type: SET_ACCOUNTS, payload }
}

export const setSelectedAccount = (payload) => {
  return { type: SET_SELECTED_ACCOUNT, payload }
}

export const addAccount = (payload) => {
  return { type: ADD_ACCOUNT, payload }
}

export const setSwitchAccountToast = (payload) => {
  return { type: SET_SWITCH_ACCOUNT_TOAST, payload }
}

export const setShowSeedPhraseReminder = (payload) => {
  console.log('setShowSeedPhraseReminder:', payload)
  return { type: SET_SHOW_SEED_PHRASE_REMINDER, payload }
}

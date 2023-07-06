import {
  ADD_ACCOUNT,
  LOG_OUT,
  SET_ACCOUNTS,
  // SET_INBOX_ITEMS,
  SET_NAVIGATION_LINK,
  // SET_PUBLIC_PROFILE_DATA,
  SET_SELECTED_ACCOUNT,
  SET_SHOW_SEED_PHRASE_REMINDER,
  SET_SWITCH_ACCOUNT_TOAST,
} from './action-types'

// export const setPublicProfileData = (payload) => {
//   return { type: SET_PUBLIC_PROFILE_DATA, payload }
// }

// export const setInboxItems = (payload) => {
//   return { type: SET_INBOX_ITEMS, payload }
// }

export const setAccounts = (payload) => {
  return { type: SET_ACCOUNTS, payload }
}

export const setSelectedAccount = (payload) => {
  return { type: SET_SELECTED_ACCOUNT, payload }
}

export const addAccount = (payload) => {
  return { type: ADD_ACCOUNT, payload }
}

// export const setSwitchAccountToast = (payload) => {
//   return { type: SET_SWITCH_ACCOUNT_TOAST, payload }
// }

// export const setShowSeedPhraseReminder = (payload) => {
//   return { type: SET_SHOW_SEED_PHRASE_REMINDER, payload }
// }

export const setNavigationLink = (payload) => {
  return { type: SET_NAVIGATION_LINK, payload }
}

export const logout = () => {
  return {
    type: LOG_OUT,
  }
}

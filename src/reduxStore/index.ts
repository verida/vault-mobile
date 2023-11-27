import { configureStore } from '@reduxjs/toolkit'
import { assetsApi } from 'features/assets'
import { authSlice } from 'features/auth'
import { cryptoWalletApi, cryptoWalletSlice } from 'features/cryptoWallet'
import { identitiesSlice } from 'features/identities'
import { inboxSlice } from 'features/inbox'
import { linksSlice } from 'features/links'
import { profilesSlice } from 'features/profiles'
import { seedphrasesSlice } from 'features/seedphrases'
import { settingsSlice } from 'features/settings'
import debounce from 'lodash/debounce'
import { combineReducers } from 'redux'
import { batchedSubscribe } from 'redux-batched-subscribe'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'

import { reduxPersistMmkvStorage } from './utils/mmkvPersistStorage'

const persistConfig = {
  key: 'root',
  storage: reduxPersistMmkvStorage,
  // Whitelisted nonsensitive data slides to store inside redux-persist
  whitelist: [
    'settings',
    'profiles',

    // TODO: Revisit, maybe we shouldn't persist API results in the first place.
    // But that's really a nice performance enhancement ATM considering some APIs take an average of 3-10 seconds to load.
    cryptoWalletApi.reducerPath,
    assetsApi.reducerPath,
  ],
}

export const rootReducer = combineReducers({
  auth: authSlice.reducer,
  identities: identitiesSlice.reducer,
  cryptoWallets: cryptoWalletSlice.reducer,
  settings: settingsSlice.reducer,
  seedPhrases: seedphrasesSlice.reducer,
  inbox: inboxSlice.reducer,
  profiles: profilesSlice.reducer,
  links: linksSlice.reducer,

  // API reducers
  [cryptoWalletApi.reducerPath]: cryptoWalletApi.reducer,
  [assetsApi.reducerPath]: assetsApi.reducer,
})

const debounceNotify = debounce((notify) => notify(), 30)
const persistedReducer = persistReducer(persistConfig, rootReducer)

const middleware = [] as any

if (__DEV__) {
  const createDebugger = require('redux-flipper').default
  middleware.push(createDebugger())
}

export function configureAppStore() {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
        immutableCheck: false, // Disable immutable check as takes more than 32 ms and shows a warning, may enable when need to deep debug redux
      })
        .concat(middleware)
        .concat(cryptoWalletApi.middleware)
        .concat(assetsApi.middleware),
    devTools: __DEV__,
    enhancers: [batchedSubscribe(debounceNotify) as any],
  })
  return store
}

const store = configureAppStore()
const persistor = persistStore(store)

export { store, persistor }

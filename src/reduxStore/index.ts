import { configureStore } from '@reduxjs/toolkit'
import { config } from 'config'
import { assetsApi } from 'features/assets'
import { authSlice } from 'features/auth'
import {
  BLOCKCHAIN_SLICE_NAME,
  blockchainApi,
  blockchainSlice,
} from 'features/blockchain'
import {
  cryptoWalletApi,
  cryptoWalletLegacyApi,
  cryptoWalletSlice,
} from 'features/cryptoWallet'
import { identitiesSlice } from 'features/identities'
import { inboxSlice } from 'features/inbox'
import { profilesSlice } from 'features/profiles'
import { seedphrasesSlice } from 'features/seedphrases'
import { settingsSlice } from 'features/settings'
import debounce from 'lodash/debounce'
import { combineReducers } from 'redux'
import { batchedSubscribe } from 'redux-batched-subscribe'
import {
  createMigrate,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'

import {
  REDUX_PERSIST_CURRENT_VERSION,
  reduxPersistMigrations,
} from './migrations'
import { reduxPersistMmkvStorage } from './utils/mmkvPersistStorage'

const persistConfig = {
  key: 'root',
  storage: reduxPersistMmkvStorage,
  version: REDUX_PERSIST_CURRENT_VERSION,
  migrate: createMigrate(reduxPersistMigrations, { debug: config.dev.devMode }),
  // Whitelisted nonsensitive data slides to store inside redux-persist
  whitelist: [
    // BLOCKCHAIN_SLICE_NAME,

    'settings',
    'profiles',

    // TODO: Revisit, maybe we shouldn't persist API results in the first place.
    // But that's really a nice performance enhancement ATM considering some APIs take an average of 3-10 seconds to load.
    // blockchainApi.reducerPath,
    // cryptoWalletApi.reducerPath,
    // cryptoWalletLegacyApi.reducerPath,
    // assetsApi.reducerPath,
  ],
}

export const rootReducer = combineReducers({
  auth: authSlice.reducer,
  [BLOCKCHAIN_SLICE_NAME]: blockchainSlice.reducer,
  identities: identitiesSlice.reducer,
  cryptoWallets: cryptoWalletSlice.reducer,
  settings: settingsSlice.reducer,
  seedPhrases: seedphrasesSlice.reducer,
  inbox: inboxSlice.reducer,
  profiles: profilesSlice.reducer,

  // API reducers
  [blockchainApi.reducerPath]: blockchainApi.reducer,
  [cryptoWalletApi.reducerPath]: cryptoWalletApi.reducer,
  [cryptoWalletLegacyApi.reducerPath]: cryptoWalletLegacyApi.reducer,
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
        .concat(blockchainApi.middleware)
        .concat(cryptoWalletApi.middleware)
        .concat(cryptoWalletLegacyApi.middleware)
        .concat(assetsApi.middleware),
    devTools: __DEV__,
    enhancers: [batchedSubscribe(debounceNotify) as any],
  })
  return store
}

const store = configureAppStore()
const persistor = persistStore(store)

export { store, persistor }

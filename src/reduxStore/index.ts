import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore } from '@reduxjs/toolkit'
import { assetsApi } from 'features/assets'
import { authSlice } from 'features/auth'
import { identitiesSlice } from 'features/identities'
import { inboxSlice } from 'features/inbox'
import { linksSlice } from 'features/links'
import { profilesSlice } from 'features/profiles'
import { seedphrasesSlice } from 'features/seedphrases'
import { settingsSlice } from 'features/settings'
import { walletsApi, walletsSlice } from 'features/wallets'
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

import { walletConnectReducer } from './wallet-connect/reducer'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['walletConnect'],
}

export const rootReducer = combineReducers({
  walletConnect: walletConnectReducer,

  // New reducers
  auth: authSlice.reducer,
  identities: identitiesSlice.reducer,
  wallets: walletsSlice.reducer,
  settings: settingsSlice.reducer,
  seedPhrases: seedphrasesSlice.reducer,
  inbox: inboxSlice.reducer,
  profiles: profilesSlice.reducer,
  links: linksSlice.reducer,

  // API reducers
  [walletsApi.reducerPath]: walletsApi.reducer,
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
      })
        .concat(middleware)
        .concat(walletsApi.middleware)
        .concat(assetsApi.middleware),
    devTools: __DEV__,
    enhancers: [batchedSubscribe(debounceNotify) as any],
  })
  return store
}

const store = configureAppStore()
const persistor = persistStore(store)

export { store, persistor }

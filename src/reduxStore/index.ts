import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore } from '@reduxjs/toolkit'
import { assetsApi } from 'features/assets'
import { walletsApi } from 'features/wallets'
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

import { mainReducer } from './mainReducer'
import { tokensReducer } from './tokens/reducer'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['tokens', walletsApi.reducerPath],
}

export const rootReducer = combineReducers({
  main: mainReducer,
  tokens: tokensReducer, // TODO: Refactor tokens to be in walletsApi slice?

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

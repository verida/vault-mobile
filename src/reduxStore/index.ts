import AsyncStorage from '@react-native-async-storage/async-storage'
import debounce from 'lodash/debounce'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { batchedSubscribe } from 'redux-batched-subscribe'
import { composeWithDevTools } from 'redux-devtools-extension'
import { persistReducer, persistStore } from 'redux-persist'
import thunk from 'redux-thunk'

import { apiErrorReducer } from './api/errorReducer'
import { apiReducer } from './api/reducer'
import { collectiblesReducer } from './collectibles/reducer'
import { mainReducer } from './mainReducer'
import { tokensReducer } from './tokens/reducer'
import { walletConnectReducer } from './wallet-connect/reducer'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['walletConnect', 'tokens', 'collectibles'],
}

export const rootReducer = combineReducers({
  main: mainReducer,
  walletConnect: walletConnectReducer,
  tokens: tokensReducer,
  collectibles: collectiblesReducer,

  // Helper for tracking API request states automatically [REQUEST, SUCCESS, FAILURE]
  api: apiReducer,
  apiError: apiErrorReducer,
  // --
})

const debounceNotify = debounce((notify) => notify(), 30)

const persistedReducer = persistReducer(persistConfig, rootReducer)

const composeEnhancers = composeWithDevTools({
  // Specify here name, actionsBlacklist, actionsCreators and other options
})

const middleware = [thunk]

if (__DEV__) {
  const createDebugger = require('redux-flipper').default
  middleware.push(createDebugger())
}

const store = createStore(
  persistedReducer,
  composeEnhancers(
    applyMiddleware(...middleware),
    batchedSubscribe(debounceNotify)
    // other store enhancers if any
  )
)
const persistor = persistStore(store)

export { store, persistor }

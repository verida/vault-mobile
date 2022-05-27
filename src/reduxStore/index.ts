import AsyncStorage from '@react-native-community/async-storage'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { persistReducer, persistStore } from 'redux-persist'
import thunk from 'redux-thunk'

import { mainReducer } from './mainReducer'
import { walletReducer } from './wallet/reducer'
import { walletConnectReducer } from './wallet-connect/reducer'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['walletConnect'],
}

export const rootReducer = combineReducers({
  main: mainReducer,
  wallet: walletReducer,
  walletConnect: walletConnectReducer,
})

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
    applyMiddleware(...middleware)
    // other store enhancers if any
  )
)
const persistor = persistStore(store)

export { store, persistor }

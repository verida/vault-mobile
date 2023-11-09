/* eslint-disable import/first */
// HACK: Satisfy @walletconnect/utils:isReactNative
// https://github.com/WalletConnect/walletconnect-utils/blob/d057e0f63f726b3cb6595dc3ca1a32234240c2e5/misc/environment/src/env.ts#L1
Object.assign(navigator || {}, { product: 'ReactNative' })

import '@walletconnect/react-native-compat'
import './shim'
import 'react-native-get-random-values'
import '@ethersproject/shims'
import 'react-native-crypto'
import 'text-encoding-polyfill'
import 'intl'
import 'intl/locale-data/jsonp/en'
import 'react-native-gesture-handler'

import { AppRegistry, LogBox } from 'react-native'

import App from './src/App'
import { config } from './src/config'

if (__DEV__) {
  if (config.dev.disableLogBox) {
    LogBox.ignoreAllLogs()
  } else {
    // Disable some known warnings on the device LogBox view, still showing them on the console to be fixed later
    const ignoreWarns = [
      'TouchID error',
      'EventEmitter.removeListener',
      'Unrecognized WebSocket connection option',
      'Setting a timer for a long period of time',
      'ViewPropTypes will be removed from React Native',
      'AsyncStorage has been extracted from react-native',
      "exported from 'deprecated-react-native-prop-types'.",
      'VirtualizedLists should never be nested inside plain ScrollViews',
      'Usage of "messaging().registerDeviceForRemoteMessages()" is not required.',
      "The provided value 'ms-stream' is not a valid 'responseType'",
      "The provided value 'moz-chunked-arraybuffer' is not a valid 'responseType'",

      // WalletConnect
      'Verify iframe failed to load: https://verify.walletconnect.com',
      'core/verify-api',
    ]
    LogBox.ignoreLogs(ignoreWarns)
  }
}

AppRegistry.registerComponent('main', () => App)

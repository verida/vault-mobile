import './shim'
import 'react-native-get-random-values'
import '@ethersproject/shims'
import 'react-native-crypto'
import 'text-encoding-polyfill'

import { AppRegistry, LogBox } from 'react-native'

import App from './src/App'

if (__DEV__) {
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
  ]

  LogBox.ignoreLogs(ignoreWarns)
}

AppRegistry.registerComponent('main', () => App)

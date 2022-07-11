import './shim'

import { AppRegistry, YellowBox } from 'react-native'

import App from './src/App'

YellowBox.ignoreWarnings([''])

AppRegistry.registerComponent('main', () => App)

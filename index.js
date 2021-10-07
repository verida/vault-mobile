import './shim'

import { registerRootComponent } from 'expo'
import App from './src/App'

import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings([''])

registerRootComponent(App)

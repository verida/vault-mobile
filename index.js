import { registerRootComponent } from 'expo';
import App from './src/App';

import {YellowBox} from 'react-native';
YellowBox.ignoreWarnings([
    'SplashScreen',
    'DatePickerIOS',
    'Native splash screen',
    'componentWillReceiveProps',
    'useNativeDriver'
]);

registerRootComponent(App);

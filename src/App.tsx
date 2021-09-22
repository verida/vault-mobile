import './global'

import React, { useState } from 'react'
import { Provider } from 'react-redux'

import AppLoading from 'expo-app-loading'
import * as Font from 'expo-font'

import store from 'reduxStore'
import { NavigationContainer } from '@react-navigation/native'
import RootNavigator from 'navigation/RootNavigator'
import Authenticate from 'pages/Authentication/Authenticate'
import { AuthProvider } from 'hooks/useAuth'
import linking from 'navigation/linkingConfiguration'
import 'react-native-crypto'
import PolyfillCrypto from 'react-native-webview-crypto'
import codePush, { CodePushOptions } from 'react-native-code-push'

function App() {
  const [loading, setLoading] = useState(true)

  const loadFonts = async () => {
    const NunitoSans = require('./assets/fonts/NunitoSans-Regular.ttf')
    const NunitoSansSemiBold = require('./assets/fonts/NunitoSans-SemiBold.ttf')
    const NunitoSansBold = require('./assets/fonts/NunitoSans-Bold.ttf')

    return Promise.all([
      Font.loadAsync({ NunitoSans }),
      Font.loadAsync({ NunitoSansSemiBold }),
      Font.loadAsync({ NunitoSansBold }),
    ])
  }

  const init = async () => {
    await loadFonts()
  }

  const AppContent = (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <Authenticate>
            <RootNavigator />
          </Authenticate>
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  )

  return loading ? (
    <AppLoading
      startAsync={init}
      onFinish={() => setLoading(false)}
      onError={console.warn}
    />
  ) : (
    <>
      <PolyfillCrypto />
      {AppContent}
    </>
  )
}

const codePushOptions: CodePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE,
}

export default codePush(codePushOptions)(App)

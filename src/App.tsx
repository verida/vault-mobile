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
import * as Sentry from '@sentry/react-native'
import Config from 'react-native-config'

Sentry.init({
  dsn: 'https://e71ecbfe763e42189ac8841ae27753cc@o999692.ingest.sentry.io/5958805',
  environment: Config.SENTRY_ENVIRONMENT,
})

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

const WrappedWithSentry = Sentry.wrap(App)
export default codePush(codePushOptions)(WrappedWithSentry)

import './global'
import 'react-native-crypto'

import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import messaging from '@react-native-firebase/messaging'
import { NavigationContainer } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import AppLoading from 'expo-app-loading'
import * as Font from 'expo-font'
import { CHANNEL_ID, configureNotifications } from 'helpers/notifications'
import React, { useState } from 'react'
import codePush, { CodePushOptions } from 'react-native-code-push'
import Config from 'react-native-config'
import PushNotification from 'react-native-push-notification'
import { RootSiblingParent } from 'react-native-root-siblings'
import PolyfillCrypto from 'react-native-webview-crypto'
import { Provider } from 'react-redux'
import store from 'reduxStore'

import SwitchAccountToast from 'components/SwitchAccountToast'
import { AuthProvider } from 'hooks/useAuth'
import linking from 'navigation/linkingConfiguration'
import RootNavigator, { navigationRef } from 'navigation/RootNavigator'
import Authenticate from 'pages/Authentication/Authenticate'

configureNotifications()

messaging().setBackgroundMessageHandler(async (_remoteMessage) => {
  PushNotification.localNotification({
    title: 'New inbox message',
    message: 'Please refresh your inbox',
    channelId: CHANNEL_ID,
    userInfo: {
      category: 'Inbox',
    },
  })
})

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
        <NavigationContainer linking={linking} ref={navigationRef}>
          <Authenticate>
            <RootSiblingParent>
              <ActionSheetProvider>
                <RootNavigator />
              </ActionSheetProvider>
            </RootSiblingParent>
          </Authenticate>
        </NavigationContainer>
      </AuthProvider>
      <SwitchAccountToast />
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

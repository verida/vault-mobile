import './global'
import 'react-native-crypto'
import 'text-encoding-polyfill'

import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import messaging from '@react-native-firebase/messaging'
import { NavigationContainer } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { WalletConnectProviderv2 } from 'contexts/WalletConnectProviderv2'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { CHANNEL_ID, configureNotifications } from 'helpers/notifications'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import codePush, { CodePushOptions } from 'react-native-code-push'
import Config from 'react-native-config'
import PushNotification from 'react-native-push-notification'
import { RootSiblingParent } from 'react-native-root-siblings'
import PolyfillCrypto from 'react-native-webview-crypto'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import { persistor, store } from 'reduxStore'

import SwitchAccountToast from 'components/SwitchAccountToast'
import { SHUTDOWN_APP } from 'constants/config'
import { AuthProvider } from 'hooks/useAuth'
import linking from 'navigation/linkingConfiguration'
import RootNavigator, { navigationRef } from 'navigation/RootNavigator'
import OutOfService from 'pages/Account/OutOfService'
import Authenticate from 'pages/Authentication/Authenticate'

import { ModalProvider } from './contexts/ModalContext'
import { WalletConnectProvider } from './contexts/WalletConnectContext'

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
  dsn: 'https://982fadf2fca74043b9395c50458aeffa@o1233403.ingest.sentry.io/6382201',
  environment: Config.SENTRY_ENVIRONMENT,
  beforeSend: (event, hint) => {
    if (__DEV__) {
      const error = hint?.originalException || hint?.syntheticException || event
      // Log error on dev mode
      // eslint-disable-next-line no-console
      console.error(error, (error as Error).stack)
      return null // this drops the event and nothing will be send to sentry
    }
    return event
  },
})

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFonts = async () => {
      const NunitoSans = require('./assets/fonts/NunitoSans-Regular.ttf')
      const NunitoSansSemiBold = require('./assets/fonts/NunitoSans-SemiBold.ttf')
      const NunitoSansBold = require('./assets/fonts/NunitoSans-Bold.ttf')

      try {
        await Promise.all([
          Font.loadAsync({ NunitoSans }),
          Font.loadAsync({ NunitoSansSemiBold }),
          Font.loadAsync({ NunitoSansBold }),
        ])
      } catch (error) {
        Sentry.captureException(error)
        Alert.alert('Error', 'Failed to initialize')
      } finally {
        setLoading(false)
        await SplashScreen.hideAsync()
      }
    }

    const init = async () => {
      try {
        // Prevent native splash screen from autohiding
        await SplashScreen.preventAutoHideAsync()
      } catch (e) {
        Sentry.captureException(e)
      }
      loadFonts()
    }

    init()
  }, [])

  if (SHUTDOWN_APP) return <OutOfService />

  const AppContent = (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <NavigationContainer linking={linking} ref={navigationRef}>
            <Authenticate>
              <RootSiblingParent>
                <ActionSheetProvider>
                  <ModalProvider>
                    <WalletConnectProvider>
                      <WalletConnectProviderv2>
                        <RootNavigator />
                      </WalletConnectProviderv2>
                    </WalletConnectProvider>
                  </ModalProvider>
                </ActionSheetProvider>
              </RootSiblingParent>
            </Authenticate>
          </NavigationContainer>
        </AuthProvider>
        <SwitchAccountToast />
      </PersistGate>
    </Provider>
  )

  return loading ? null : (
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

import 'react-native-url-polyfill/auto'

import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import messaging from '@react-native-firebase/messaging'
import { NavigationContainer } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { PolygonIdProvider } from 'contexts/PolygonIdContext'
import { ThemeProvider } from 'contexts/ThemeContext'
import { WalletConnectProviderv2 } from 'contexts/WalletConnectContextv2'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { CHANNEL_ID, configureNotifications } from 'helpers/notifications'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import codePush, { CodePushOptions } from 'react-native-code-push'
import Config from 'react-native-config'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import PushNotification from 'react-native-push-notification'
import { RootSiblingParent } from 'react-native-root-siblings'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import PolyfillCrypto from 'react-native-webview-crypto'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import { persistor, store } from 'reduxStore'

import MetaServerChecks from 'components/MetaServerChecks/MetaServerChecks'
import SwitchAccountToast from 'components/SwitchAccountToast'
import { SHUTDOWN_APP } from 'constants/config'
import { AuthProvider } from 'hooks/useAuth'
import linking from 'navigation/linkingConfiguration'
import RootNavigator, { navigationRef } from 'navigation/RootNavigator'
import OutOfService from 'pages/Account/OutOfService'
import Authenticate from 'pages/Authentication/Authenticate'
import { defaultTheme } from 'styles/theme'

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
  dsn: 'https://b850525444734a138f9fddcc918d5ac1@o4503997119725568.ingest.sentry.io/4503997121495040',
  environment: Config.SENTRY_ENVIRONMENT,
  beforeSend: (event, hint) => {
    if (__DEV__) {
      const error =
        hint?.originalException ||
        JSON.stringify(
          event?.exception ?? { message: 'Unknown error' },
          null,
          2
        )
      // eslint-disable-next-line no-console
      console.error(error) // error will be shown on LogBox and Console

      return null // this drops the event and nothing will be send to Sentry
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
        <SafeAreaProvider>
          <ThemeProvider initial={defaultTheme}>
            <NavigationContainer linking={linking} ref={navigationRef}>
              <ModalProvider>
                <AuthProvider>
                  <Authenticate>
                    <RootSiblingParent>
                      <ActionSheetProvider>
                        <WalletConnectProvider>
                          <WalletConnectProviderv2>
                            <PolygonIdProvider>
                              <GestureHandlerRootView style={{ flex: 1 }}>
                                <RootNavigator />
                              </GestureHandlerRootView>
                              <MetaServerChecks />
                            </PolygonIdProvider>
                          </WalletConnectProviderv2>
                        </WalletConnectProvider>
                      </ActionSheetProvider>
                    </RootSiblingParent>
                  </Authenticate>
                </AuthProvider>
                <SwitchAccountToast />
              </ModalProvider>
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
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

import 'react-native-url-polyfill/auto'

import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import messaging from '@react-native-firebase/messaging'
import { NavigationContainer } from '@react-navigation/native'
import { ThemeProvider } from 'contexts/ThemeContext'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { navigationLinkingConfiguration } from 'features/deepLinks'
import { Sentry } from 'features/telemetry'
import { WalletConnectProvider } from 'features/walletConnect'
import { CHANNEL_ID, configureNotifications } from 'helpers/notifications'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import codePush, { CodePushOptions } from 'react-native-code-push'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import PushNotification from 'react-native-push-notification'
import { RootSiblingParent } from 'react-native-root-siblings'
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context'
import PolyfillCrypto from 'react-native-webview-crypto'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import { persistor, store } from 'reduxStore'
import { initApplication } from 'utils'

import MetaServerChecks from 'components/MetaServerChecks/MetaServerChecks'
import SwitchAccountToast from 'components/SwitchAccountToast'
import { SHUTDOWN_APP } from 'constants/config'
import { AuthProvider } from 'hooks/useAuth'
import { navigationRef, RootNavigator } from 'navigation/RootNavigator'
import OutOfService from 'pages/Account/OutOfService'
import Authenticate from 'pages/Authentication/Authenticate'
import { defaultTheme } from 'styles/theme'

import { ModalProvider } from './contexts/ModalContext'

initApplication()

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
      <PersistGate persistor={persistor}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ThemeProvider initial={defaultTheme}>
            <AuthProvider>
              <NavigationContainer
                linking={navigationLinkingConfiguration}
                ref={navigationRef}>
                <ModalProvider>
                  <Authenticate>
                    <RootSiblingParent>
                      <ActionSheetProvider>
                        <WalletConnectProvider>
                          <GestureHandlerRootView style={styles.flex}>
                            <RootNavigator />
                          </GestureHandlerRootView>
                          <MetaServerChecks />
                        </WalletConnectProvider>
                      </ActionSheetProvider>
                    </RootSiblingParent>
                  </Authenticate>
                  <SwitchAccountToast />
                </ModalProvider>
              </NavigationContainer>
            </AuthProvider>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
})

const codePushOptions: CodePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE,
}

const WrappedWithSentry = Sentry.wrap(App)
export default codePush(codePushOptions)(WrappedWithSentry)

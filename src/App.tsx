import 'react-native-url-polyfill/auto'

import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { ThemeProvider } from 'contexts/ThemeContext'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { ConfigProvider } from 'features/config'
import { IdentityDrawerProvider } from 'features/identityDrawer'
import { Logger, Sentry } from 'features/telemetry'
import { WalletConnectProvider } from 'features/walletConnect'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import codePush, { CodePushOptions } from 'react-native-code-push'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
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

import { MetaServerChecks } from 'components/MetaServerChecks'
import SwitchAccountToast from 'components/SwitchAccountToast'
import { AuthProvider } from 'hooks/useAuth'
import { NavigationProvider } from 'navigation/NavigationProvider'
import { RootNavigator } from 'navigation/RootNavigator'
import { Authenticate } from 'pages/Authentication/Authenticate'
import { defaultTheme } from 'styles/theme'

import { ModalProvider } from './contexts/ModalContext'

initApplication()

// TODO: Move other initialisations into the 'initApplication'

const logger = new Logger('App')

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
        logger.error(error)
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
      } catch (error) {
        logger.error(error)
      }
      loadFonts()
    }

    init()
  }, [])

  const AppContent = (
    <ConfigProvider>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <ThemeProvider initial={defaultTheme}>
              <AuthProvider>
                <NavigationProvider>
                  <IdentityDrawerProvider>
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
                  </IdentityDrawerProvider>
                </NavigationProvider>
              </AuthProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ConfigProvider>
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

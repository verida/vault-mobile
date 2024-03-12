import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { NavigationContainer } from '@react-navigation/native'
import { AppHandlers } from 'contexts/AppHandlers'
import { BlockchainProvider } from 'features/blockchain'
import { ConfigProvider } from 'features/config'
import {
  CryptoWalletBalanceProvider,
  CryptoWalletProvider,
} from 'features/cryptoWallet'
import { IdentityDrawerProvider } from 'features/identityDrawer'
import { PolygonIdProvider } from 'features/polygonid'
import { ProtocolsProvider } from 'features/protocols'
import { VeramoProvider } from 'features/veramo'
import { WalletConnectProvider } from 'features/walletConnect'
import { navigationLinkingConfiguration, navigationRef } from 'navigation'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import { persistor, store } from 'reduxStore'

import { MetaServerChecks } from 'components/MetaServerChecks'
import SwitchAccountToast from 'components/SwitchAccountToast'
import { AuthProvider } from 'hooks/useAuth'
import { Authenticate } from 'pages/Authentication/Authenticate'
import { defaultTheme } from 'styles/theme'

import { ModalProvider } from './ModalContext'
import { ThemeProvider } from './ThemeContext'

export type AppContextsProps = {
  children: React.ReactNode
}

/**
 * Main place to declare all the contexts
 */
export const AppContexts: React.FunctionComponent<AppContextsProps> = (
  props
) => {
  const { children } = props

  return (
    <ConfigProvider>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <ThemeProvider initial={defaultTheme}>
              <AuthProvider>
                <NavigationContainer
                  linking={navigationLinkingConfiguration}
                  ref={navigationRef}>
                  <IdentityDrawerProvider>
                    <ModalProvider>
                      <Authenticate>
                        <RootSiblingParent>
                          <ActionSheetProvider>
                            <BlockchainProvider>
                              <CryptoWalletBalanceProvider>
                                <CryptoWalletProvider>
                                  <WalletConnectProvider>
                                    <GestureHandlerRootView style={{ flex: 1 }}>
                                      <PolygonIdProvider>
                                        <VeramoProvider>
                                          <ProtocolsProvider>
                                            {/* Keep the AppHandlers last */}
                                            <AppHandlers />
                                            {children}
                                            {/*  */}
                                          </ProtocolsProvider>
                                        </VeramoProvider>
                                      </PolygonIdProvider>
                                    </GestureHandlerRootView>
                                    <MetaServerChecks />
                                  </WalletConnectProvider>
                                </CryptoWalletProvider>
                              </CryptoWalletBalanceProvider>
                            </BlockchainProvider>
                          </ActionSheetProvider>
                        </RootSiblingParent>
                      </Authenticate>
                      <SwitchAccountToast />
                    </ModalProvider>
                  </IdentityDrawerProvider>
                </NavigationContainer>
              </AuthProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ConfigProvider>
  )
}

import remoteConfig from '@react-native-firebase/remote-config'
import * as Sentry from '@sentry/react-native'
import { config, mergeWithRemoteConfig } from 'config'
import * as SecureStore from 'helpers/VeridaSecureStore'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Alert, AppState, AppStateStatus } from 'react-native'
import RNRestart from 'react-native-restart'

import LoadingView from 'components/LoadingView'

import { compareAppConfig } from './utils'

export type ForcedUpgradeType = {
  minVersion?: string
  required?: boolean
  message?: string
  storeUrl?: string
  furtherInfo?: string
}

export type ForcedCreateAccountType = {
  required?: boolean
  message?: string
  furtherInfo?: string
}

interface FirebaseRemoteConfigContextType {
  forcedUpgrade?: ForcedUpgradeType
  forcedCreateAccount?: ForcedCreateAccountType
  fetchRemoteConfig: () => void
}

const FirebaseRemoteConfigContext = createContext<
  FirebaseRemoteConfigContextType | undefined
>(undefined)

export function useFirebaseRemoteConfig() {
  const context = useContext(FirebaseRemoteConfigContext)
  if (context === undefined) {
    throw new Error(
      'useFirebaseRemoteConfig must be used within a FirebaseRemoteConfigProvider'
    )
  }
  return context
}

export function FirebaseRemoteConfigProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [forcedUpgrade, setForcedUpgrade] = useState<ForcedUpgradeType>({})
  const [forcedCreateAccount, setForcedCreateAccount] =
    useState<ForcedCreateAccountType>({})

  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const appState = useRef(AppState.currentState)

  const fetchRemoteConfig = useCallback(() => {
    remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: 30000,
    })

    remoteConfig()
      .setDefaults({
        forced_upgrade: '{}',
        forced_create_new_account: '{}',
        wallet_app_configs: '{}',
      })
      .then(() => remoteConfig()?.fetchAndActivate())
      .then(Boolean)
      .then(async (fetchedRemotely) => {
        if (fetchedRemotely) {
          // Handle forced app upgrade
          const forcedUpgradeJSON = remoteConfig().getValue('forced_upgrade')
          const forcedUpgradeInfo = JSON.parse(forcedUpgradeJSON.asString())
          setForcedUpgrade(forcedUpgradeInfo)

          // Handle forced create new account
          const forcedCreateAccountInfo = JSON.parse(
            remoteConfig().getValue('forced_create_new_account').asString()
          )
          setForcedCreateAccount(forcedCreateAccountInfo)

          // Handle remote app config
          const remoteAppConfig = JSON.parse(
            remoteConfig().getValue('wallet_app_configs').asString()
          )

          const APP_CONFIG_STORAGE_KEY = 'APP_CONFIG'
          const localAppConfig = JSON.parse(
            (await SecureStore.getItemAsync(APP_CONFIG_STORAGE_KEY)) || '{}'
          )
          if (!compareAppConfig(remoteAppConfig, localAppConfig)) {
            SecureStore.setItemAsync(
              APP_CONFIG_STORAGE_KEY,
              remoteConfig().getValue('wallet_app_configs').asString()
            )
          }

          // Merge with remote config on the app initial load
          if (initialLoad) {
            mergeWithRemoteConfig(remoteAppConfig || localAppConfig)
          } else if (!compareAppConfig(remoteAppConfig, config)) {
            // Handle runtime app config updated, need to reload the app
            const appNeedsReload = mergeWithRemoteConfig(remoteAppConfig)
            if (appNeedsReload) {
              Alert.alert(
                'Application Configuration Updated',
                'Application configurations have been updated, the app needs to be restarted.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      RNRestart.restart()
                    },
                  },
                ]
              )
            }
          }
        }
      })
      .catch((error) => {
        Sentry.captureException(error)
      })
      .finally(() => {
        setInitialLoad(false)
        setLoading(false)
      })
  }, [initialLoad])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        fetchRemoteConfig()
      }

      appState.current = nextAppState
    }
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )

    // Initial fetch
    fetchRemoteConfig()

    return () => {
      subscription?.remove()
    }
  }, [fetchRemoteConfig])

  if (loading) {
    return <LoadingView />
  }

  return (
    <FirebaseRemoteConfigContext.Provider
      value={{
        fetchRemoteConfig,
        forcedUpgrade,
        forcedCreateAccount,
      }}>
      {children}
    </FirebaseRemoteConfigContext.Provider>
  )
}

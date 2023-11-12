import remoteConfig from '@react-native-firebase/remote-config'
import * as Sentry from '@sentry/react-native'
import { config as appConfig, mergeWithRemoteConfig } from 'config'
import * as SecureStore from 'helpers/VeridaSecureStore'
import { isEqual } from 'lodash'
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Alert, AppState, AppStateStatus } from 'react-native'
import RNRestart from 'react-native-restart'

import LoadingView from 'components/LoadingView'
import { MaintenanceScreen } from 'pages/Account/MaintenanceScreen'

import {
  ConfigContextType,
  ForcedCreateAccountType,
  ForcedUpgradeType,
  MaintenanceMode,
} from '../@types'

const DEFAULT_REMOTE_CONFIG = {
  forced_upgrade: '{}',
  forced_create_new_account: '{}',
  wallet_app_config: '{}',
  maintenance_mode: '{}',
}

const REMOTE_CONFIG_FETCH_INTERVAL_MILLIS = 30000

export const ConfigContext = createContext<ConfigContextType | null>(null)

export const ConfigProvider: React.FC = ({ children }) => {
  const [forcedUpgrade, setForcedUpgrade] = useState<ForcedUpgradeType>({})
  const [forcedCreateAccount, setForcedCreateAccount] =
    useState<ForcedCreateAccountType>({})
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceMode>({})

  const [loading, setLoading] = useState(true)
  const initialLoadRef = useRef(true)
  const appState = useRef(AppState.currentState)

  const fetchRemoteConfig = useCallback(() => {
    remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: REMOTE_CONFIG_FETCH_INTERVAL_MILLIS,
    })

    console.log('Fetch Remote Config')
    remoteConfig()
      .setDefaults(DEFAULT_REMOTE_CONFIG)
      .then(() => remoteConfig()?.fetchAndActivate())
      .then(Boolean)
      .then(async (fetchedRemotely) => {
        if (fetchedRemotely) {
          // Handle maintenance mode
          const maintenanceModeValue = JSON.parse(
            remoteConfig().getValue('maintenance_mode').asString()
          )
          setMaintenanceMode(maintenanceModeValue)

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
            remoteConfig().getValue('wallet_app_config').asString()
          )

          const APP_REMOTE_CONFIG_STORAGE_KEY = 'SAVED_REMOTE_CONFIG'
          const savedRemoteConfig = JSON.parse(
            (await SecureStore.getItemAsync(APP_REMOTE_CONFIG_STORAGE_KEY)) ||
              '{}'
          )

          const remoteConfigUpdated = !isEqual(
            remoteAppConfig,
            savedRemoteConfig
          )

          if (remoteConfigUpdated) {
            SecureStore.setItemAsync(
              APP_REMOTE_CONFIG_STORAGE_KEY,
              remoteConfig().getValue('wallet_app_config').asString()
            )
          }

          // Merge with remote config on the app initial load
          if (initialLoadRef.current) {
            mergeWithRemoteConfig(remoteAppConfig || savedRemoteConfig)
          } else if (remoteConfigUpdated) {
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
        console.log('Done Load Config')
        initialLoadRef.current = false
        setLoading(false)
      })
  }, [])

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
    <ConfigContext.Provider
      value={{
        config: appConfig,
        fetchRemoteConfig,
        forcedUpgrade,
        forcedCreateAccount,
      }}>
      {maintenanceMode.status === 'enabled' ? (
        <MaintenanceScreen maintenanceMode={maintenanceMode} />
      ) : (
        children
      )}
    </ConfigContext.Provider>
  )
}

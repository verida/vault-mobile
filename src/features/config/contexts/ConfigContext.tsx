import remoteConfig from '@react-native-firebase/remote-config'
import { config as appConfig, mergeWithRemoteConfig } from 'config'
import { Logger } from 'features/telemetry'
import * as SecureStore from 'helpers/VeridaSecureStore'
import { isEqual } from 'lodash'
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Alert, AppState, AppStateStatus } from 'react-native'
import RNRestart from 'react-native-restart'

import { MaintenanceScreen } from 'pages/Account/MaintenanceScreen'

import {
  ConfigContextType,
  ForcedCreateAccountType,
  ForcedUpgradeType,
  MaintenanceMode,
} from '../@types'

const logger = new Logger('ConfigContext')

const DEFAULT_REMOTE_CONFIG = {
  forced_upgrade: '{}',
  forced_create_new_account: '{}',
  wallet_app_config: '{}',
  maintenance_mode: '{}',
}

const REMOTE_CONFIG_FETCH_INTERVAL_MILLIS = 30000

export const ConfigContext = createContext<ConfigContextType | null>(null)

export const ConfigProvider: React.FC = ({ children }) => {
  const [forcedUpgrade, setForcedUpgrade] = useState<
    ForcedUpgradeType | undefined
  >(undefined)
  const [forcedCreateAccount, setForcedCreateAccount] = useState<
    ForcedCreateAccountType | undefined
  >(undefined)
  const [maintenanceMode, setMaintenanceMode] = useState<
    MaintenanceMode | undefined
  >(undefined)

  const initialLoadRef = useRef(true)
  const appState = useRef(AppState.currentState)

  const fetchRemoteConfig = useCallback(async () => {
    /*
     * Handle remote app config based on environment
     * Remote config contain configurations for all the network environments:
     * {
     *   "devnet": {
     *      ...
     *   }
     *   "testnet": {
     *      ...
     *   }
     *   "mainnet": {
     *      ...
     *   }
     * }
     */
    const veridaEnvironment = appConfig.VERIDA_ENVIRONMENT

    const APP_REMOTE_CONFIG_STORAGE_KEY = 'SAVED_REMOTE_CONFIG'
    const savedRemoteConfig = JSON.parse(
      (await SecureStore.getItemAsync(APP_REMOTE_CONFIG_STORAGE_KEY)) || '{}'
    )
    // Merge the last update from remote config on initial load
    if (initialLoadRef.current && savedRemoteConfig?.[veridaEnvironment]) {
      mergeWithRemoteConfig(savedRemoteConfig[veridaEnvironment])
      initialLoadRef.current = false
    }

    remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: REMOTE_CONFIG_FETCH_INTERVAL_MILLIS,
    })

    remoteConfig()
      .setDefaults(DEFAULT_REMOTE_CONFIG)
      .then(() => remoteConfig().fetchAndActivate())
      .then(async () => {
        // Handle maintenance mode
        try {
          const maintenanceModeData = JSON.parse(
            remoteConfig().getValue('maintenance_mode').asString()
          )
          // TODO: Validate the data with zod
          setMaintenanceMode(maintenanceModeData)
        } catch (error) {
          logger.error(
            new Error('Failed to load maintenance mode', {
              cause: error,
            })
          )
        }

        // Handle forced app upgrade
        try {
          const forcedUpgradeInfo = JSON.parse(
            remoteConfig().getValue('forced_upgrade').asString()
          )
          // TODO: Validate the data with zod
          setForcedUpgrade(forcedUpgradeInfo)
        } catch (error) {
          logger.error(
            new Error('Failed to load forced upgrade info', {
              cause: error,
            })
          )
        }

        // Handle forced create new account
        try {
          const forcedCreateAccountInfo = JSON.parse(
            remoteConfig().getValue('forced_create_new_account').asString()
          )
          // TODO: Validate the data with zod
          setForcedCreateAccount(forcedCreateAccountInfo)
        } catch (error) {
          logger.error(
            new Error('Failed to load forced create account info', {
              cause: error,
            })
          )
        }

        // Handle remote config
        try {
          const remoteAppConfig = JSON.parse(
            remoteConfig().getValue('wallet_app_config').asString()
          )
          // TODO: Validate the config with zod, have to think about if before or after merging or both.

          // Save a copy of remote config for updating the app on initialization
          if (!isEqual(remoteAppConfig, savedRemoteConfig)) {
            SecureStore.setItemAsync(
              APP_REMOTE_CONFIG_STORAGE_KEY,
              remoteConfig().getValue('wallet_app_config').asString()
            )
          }

          // Update app config for the active environment in case having config change
          if (
            !isEqual(
              remoteAppConfig?.[veridaEnvironment],
              savedRemoteConfig?.[veridaEnvironment]
            )
          ) {
            // Handle runtime app config updated, need to reload the app
            const appNeedsReload = mergeWithRemoteConfig(
              remoteAppConfig[veridaEnvironment]
            )
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
        } catch (error) {
          logger.error(
            new Error('Failed to update from remote config', {
              cause: error,
            })
          )
        }
      })
      .catch((error) => {
        logger.error(
          new Error('Failed to fetch remote config', {
            cause: error,
          })
        )
      })
      .finally(() => {
        initialLoadRef.current = false
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

  const contextValue = useMemo(
    () => ({ config: appConfig, forcedUpgrade, forcedCreateAccount }),
    [forcedCreateAccount, forcedUpgrade]
  )

  return (
    <ConfigContext.Provider value={contextValue}>
      {maintenanceMode?.status === 'enabled' ? (
        <MaintenanceScreen maintenanceMode={maintenanceMode} />
      ) : (
        children
      )}
    </ConfigContext.Provider>
  )
}

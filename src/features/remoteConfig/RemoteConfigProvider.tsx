import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config'
import * as Sentry from '@sentry/react-native'
import { compareVersions } from 'compare-versions'
import { config, mergeWithRemoteConfig } from 'config'
import { APP_VERSION } from 'constants'
import { isEqual } from 'lodash'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Alert } from 'react-native'
import RNRestart from 'react-native-restart'

import LoadingView from 'components/LoadingView'

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

type RemoteConfig = FirebaseRemoteConfigTypes.Module
type RemoteConfigParameters = {
  parameter_key: string // Define the parameter keys and their types
}

interface FirebaseRemoteConfigContextType {
  remoteConfig: RemoteConfig | null
  remoteConfigParameters: RemoteConfigParameters | null
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
  const [appRemoteConfig, setAppRemoteConfig] = useState<RemoteConfig | null>(
    null
  )
  const [forcedUpgrade, setForcedUpgrade] = useState<ForcedUpgradeType>({})
  const [forcedCreateAccount, setForcedCreateAccount] =
    useState<ForcedCreateAccountType>({})

  const [loading, setLoading] = useState(true)

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
      .then((fetchedRemotely) => {
        if (fetchedRemotely) {
          const forcedUpgradeJSON = remoteConfig().getValue('forced_upgrade')
          const forcedUpgradeInfo = JSON.parse(forcedUpgradeJSON.asString())
          setForcedUpgrade({
            ...forcedUpgradeInfo,
            required:
              compareVersions(APP_VERSION, forcedUpgradeInfo.minVersion) < 0, // Current version < required version
          })

          // Force create new account
          const forcedCreateAccountJSON = remoteConfig().getValue(
            'forced_create_new_account'
          )
          const forcedCreateAccountInfo = JSON.parse(
            forcedCreateAccountJSON.asString()
          )
          // setForcedCreateAccount(forcedCreateAccountInfo)

          const wallet_app_configs = JSON.parse(
            remoteConfig().getValue('wallet_app_configs').asString()
          )

          // setAppConfig(wallet_app_configs)

          if (wallet_app_configs) {
            mergeWithRemoteConfig(wallet_app_configs)
          } else {
            Alert.alert(
              'Configuration updated',
              'Application configurations updated, need to restart the app',
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
      })
      .catch((error) => {
        Sentry.captureException(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const fetchRemoteConfig2 = async () => {
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
        .then((fetchedRemotely) => {
          if (fetchedRemotely) {
            const wallet_app_configs = JSON.parse(
              remoteConfig().getValue('wallet_app_configs').asString()
            )

            mergeWithRemoteConfig(wallet_app_configs)
          } else {
            Alert.alert(
              'Configuration updated',
              'Application configurations updated, need to restart the app',
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
        })
        .catch((error) => {
          Sentry.captureException(error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    // fetchRemoteConfig2()

    fetchRemoteConfig()
  }, [fetchRemoteConfig])

  if (loading) {
    return <LoadingView />
  }

  return (
    <FirebaseRemoteConfigContext.Provider
      value={{ remoteConfig, fetchRemoteConfig }}>
      {children}
    </FirebaseRemoteConfigContext.Provider>
  )
}

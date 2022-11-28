import remoteConfig from '@react-native-firebase/remote-config'
import * as Sentry from '@sentry/react-native'
import { compareVersions } from 'compare-versions'
import { useCallback, useState } from 'react'
import { getVersion } from 'react-native-device-info'

remoteConfig().setConfigSettings({
  minimumFetchIntervalMillis: 30000,
})

export type ForcedUpgradeType = {
  minVersion?: string
  required?: boolean
  message?: string
  storeUrl?: string
  furtherInfo?: string
}

export type ForcedCreateAccount = {
  required?: boolean
  message?: string
  furtherInfo?: string
  check?: {
    host?: string
  }
}

export function useRemoteConfigs() {
  const [forcedUpgrade, setForcedUpgrade] = useState<ForcedUpgradeType>({})
  const [forcedCreateAccount, setForcedCreateAccount] =
    useState<ForcedCreateAccount>({})

  const fetchConfigs = useCallback(() => {
    remoteConfig()
      .setDefaults({
        forced_upgrade: '{}',
        forced_create_new_account: '{}',
      })
      .then(() => remoteConfig().fetchAndActivate())
      .then((fetchedRemotely) => {
        if (fetchedRemotely) {
          const forcedUpgradeJSON = remoteConfig().getValue('forced_upgrade')
          try {
            const forcedUpgradeInfo = JSON.parse(forcedUpgradeJSON.asString())
            setForcedUpgrade({
              ...forcedUpgradeInfo,
              required:
                compareVersions(getVersion(), forcedUpgradeInfo.minVersion) < 0, // Current version < required version
            })
          } catch (error) {
            Sentry.captureException(error)
          }

          // Force create new account
          const forcedCreateAccountJSON = remoteConfig().getValue(
            'forced_create_new_account'
          )

          try {
            const forcedCreateAccountInfo = JSON.parse(
              forcedCreateAccountJSON.asString()
            )
            setForcedCreateAccount(forcedCreateAccountInfo)
          } catch (error) {
            Sentry.captureException(error)
          }
        }
      })
  }, [])

  return { fetchConfigs, forcedUpgrade, forcedCreateAccount }
}

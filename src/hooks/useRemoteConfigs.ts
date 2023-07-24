import remoteConfig from '@react-native-firebase/remote-config'
import * as Sentry from '@sentry/react-native'
import { compareVersions } from 'compare-versions'
import { useCallback, useRef, useState } from 'react'
import { getVersion } from 'react-native-device-info'

import { useIsMounted } from './useIsMounted'

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

export function useRemoteConfigs() {
  const [forcedUpgrade, setForcedUpgrade] = useState<ForcedUpgradeType>({})
  const [forcedCreateAccount, setForcedCreateAccount] =
    useState<ForcedCreateAccountType>({})
  const fetchingRef = useRef(false)
  const isMounted = useIsMounted()

  const fetchConfigs = useCallback(() => {
    if (fetchingRef.current) {
      // Avoid duplicate requests
      return
    }
    fetchingRef.current = true

    remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: 30000,
    })

    remoteConfig()
      .setDefaults({
        forced_upgrade: '{}',
        forced_create_new_account: '{}',
      })
      .then(() => isMounted() && remoteConfig()?.fetchAndActivate())
      .then(Boolean)
      .then((fetchedRemotely) => {
        if (fetchedRemotely && isMounted()) {
          const forcedUpgradeJSON = remoteConfig().getValue('forced_upgrade')
          const forcedUpgradeInfo = JSON.parse(forcedUpgradeJSON.asString())
          setForcedUpgrade({
            ...forcedUpgradeInfo,
            required:
              compareVersions(getVersion(), forcedUpgradeInfo.minVersion) < 0, // Current version < required version
          })

          // Force create new account
          const forcedCreateAccountJSON = remoteConfig().getValue(
            'forced_create_new_account'
          )
          const forcedCreateAccountInfo = JSON.parse(
            forcedCreateAccountJSON.asString()
          )
          setForcedCreateAccount(forcedCreateAccountInfo)
        }
      })
      .catch((error) => {
        Sentry.captureException(error)
      })
      .finally(() => {
        fetchingRef.current = false
      })
  }, [isMounted])

  return { fetchConfigs, forcedUpgrade, forcedCreateAccount }
}

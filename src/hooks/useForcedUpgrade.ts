import remoteConfig from '@react-native-firebase/remote-config'
import * as Sentry from '@sentry/react-native'
import { compareVersions } from 'compare-versions'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
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

export function useForcedUpgrade() {
  const [forcedUpgrade, setForcedUpgrade] = useState<ForcedUpgradeType>({})
  const [showUpgrade, setShowUpgrade] = useState(false)
  const appState = useRef(AppState.currentState)

  const fetchConfig = useCallback(() => {
    remoteConfig()
      .setDefaults({
        forced_upgrade: '{}',
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
                compareVersions(getVersion(), forcedUpgradeInfo.minVersion) > 0, // Current version < required version
            })
            setShowUpgrade(false)
          } catch (error) {
            Sentry.captureException(error)
          }
        }
      })
  }, [])

  useEffect(() => {
    fetchConfig()
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        fetchConfig()
      }

      appState.current = nextAppState
    }
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
    return () => {
      subscription.remove()
    }
  }, [fetchConfig])

  return { showUpgrade, setShowUpgrade, forcedUpgrade }
}

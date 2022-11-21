import remoteConfig from '@react-native-firebase/remote-config'
import * as Sentry from '@sentry/react-native'
import { compareVersions } from 'compare-versions'
import { useEffect, useState } from 'react'
import { getVersion } from 'react-native-device-info'

remoteConfig().setConfigSettings({
  minimumFetchIntervalMillis: 0,
})

type ForcedUpgradeType = {
  minVersion?: string
  required?: boolean
  message?: string
  storeUrl?: string
  furtherInfo?: string
}

export function useForcedUpgrade() {
  const [forcedUpgrade, setForcedUpgrade] = useState<ForcedUpgradeType>({})
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
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
            console.log(
              'forcedUpgradeJSON',
              forcedUpgradeInfo.minVersion,
              getVersion(),
              compareVersions(getVersion(), forcedUpgradeInfo.minVersion)
            )
            setForcedUpgrade({
              ...forcedUpgradeInfo,
              required:
                compareVersions(getVersion(), forcedUpgradeInfo.minVersion) < 0,
            })
            setShowUpgrade(false)
          } catch (error) {
            Sentry.captureException(error)
          }
        }
      })
  }, [])

  return { showUpgrade, setShowUpgrade, forcedUpgrade }
}

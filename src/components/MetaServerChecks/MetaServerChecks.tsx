import remoteConfig from '@react-native-firebase/remote-config'
import { compareVersions } from 'compare-versions'
import React, { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { getVersion } from 'react-native-device-info'

import { useModal } from 'hooks/useModal'
import { useRemoteConfigs } from 'hooks/useRemoteConfigs'

import ForcedUpgradeModal from './ForcedUpgradeModal'

const MetaServerChecks = () => {
  const { showModal, dismissModal } = useModal()
  const appState = useRef(AppState.currentState)
  const { fetchConfigs, forcedUpgrade } = useRemoteConfigs()

  useEffect(() => {
    remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: 30000,
    })
  }, [])

  useEffect(() => {
    fetchConfigs()

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        fetchConfigs()
      }

      appState.current = nextAppState
    }
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
    return () => {
      subscription?.remove()
    }
  }, [fetchConfigs])

  useEffect(() => {
    const checkForcedUpgrade = () => {
      if (
        forcedUpgrade?.required &&
        compareVersions(getVersion(), forcedUpgrade.minVersion!) < 0 // Current version < required version
      ) {
        showModal(
          <ForcedUpgradeModal
            forcedUpgrade={forcedUpgrade}
            dismissModal={() => {
              dismissModal()
            }}
          />
        )
      }
    }

    const tid = setTimeout(() => {
      checkForcedUpgrade()
    }, 1000) // debounce check

    return () => {
      clearTimeout(tid)
    }
  }, [dismissModal, forcedUpgrade, showModal])

  return null
}

export default MetaServerChecks

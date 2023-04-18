import remoteConfig from '@react-native-firebase/remote-config'
import { compareVersions } from 'compare-versions'
import React, { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { getVersion } from 'react-native-device-info'

import AccountManager from 'api/AccountManager'
import { useAuth } from 'hooks/useAuth'
import { useEmitter } from 'hooks/useEmitter'
import { useModal } from 'hooks/useModal'
import { useRemoteConfigs } from 'hooks/useRemoteConfigs'

import DIDNonExistentModal from './DIDNonExistentModal'
import ForcedCreateNewAccountModal from './ForcedCreateNewAccountModal'
import ForcedUpgradeModal from './ForcedUpgradeModal'

const MetaServerChecks = () => {
  const { showModal, dismissModal } = useModal()
  const appState = useRef(AppState.currentState)
  const { fetchConfigs, forcedUpgrade, forcedCreateAccount } =
    useRemoteConfigs()
  const { forcedSignOut } = useAuth()

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
            dismissModal={dismissModal}
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

  useEffect(() => {
    const handleForcedDeleteAccounts = () => {
      showModal(
        <ForcedCreateNewAccountModal
          forcedCreateAccount={forcedCreateAccount}
          forcedSignOut={forcedSignOut}
          dismissModal={dismissModal}
        />
      )
    }
    AccountManager.getInstance().on(
      'ForcedDeleteAccounts',
      handleForcedDeleteAccounts
    )

    return () => {
      AccountManager.getInstance().off(
        'ForcedDeleteAccounts',
        handleForcedDeleteAccounts
      )
    }
  }, [dismissModal, forcedCreateAccount, forcedSignOut, showModal])

  useEmitter('ACCOUNT_NOT_EXIST', ({ retry }) => {
    showModal(<DIDNonExistentModal retry={retry} dismissModal={dismissModal} />)
  })

  return null
}

export default MetaServerChecks

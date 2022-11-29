import { NavigationContainerRefWithCurrent } from '@react-navigation/native'
import * as sentry from '@sentry/react-native'
import { compareVersions } from 'compare-versions'
import React, { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { getVersion } from 'react-native-device-info'
import { useSelector } from 'react-redux'

import { useAuth } from 'hooks/useAuth'
import { useModal } from 'hooks/useModal'
import { useRemoteConfigs } from 'hooks/useRemoteConfigs'
import { RootStackParams } from 'navigation/types'

import ForcedCreateNewAccountModal from './ForcedCreateNewAccountModal'
import ForcedUpgradeModal from './ForcedUpgradeModal'

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParams>
}

const MetaServerChecks = ({ navigationRef }: Props) => {
  const { showModal, dismissModal } = useModal()
  const appState = useRef(AppState.currentState)
  const { fetchConfigs, forcedUpgrade, forcedCreateAccount } =
    useRemoteConfigs()
  const [showForcedUpgrade, setShowForcedUpgrade] = useState(false)
  const { authenticated, forcedSignOut } = useAuth()

  const selectedAccount = useSelector(
    (state: any) => state.main.selectedAccount
  )

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
              setShowForcedUpgrade(false)
            }}
          />
        )
        setShowForcedUpgrade(true)
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
    const checkForcedCreateAccount = async () => {
      if (
        authenticated &&
        !showForcedUpgrade &&
        forcedCreateAccount?.required &&
        forcedCreateAccount?.check?.host &&
        selectedAccount?.did
      ) {
        let shouldCreateNewDiD = false

        // Fetch DID document
        // If request returns a bad request(400) then forced user sign out.
        // FIXME: This is not optimal, should have a clear sign from the server of old DIDs
        fetch(
          `${forcedCreateAccount.check.host}/load?did=${selectedAccount.did}`
        )
          .then((response) => {
            const statusCode = response.status
            if (statusCode === 200) {
              dismissModal()
              return response.json()
            } else if (statusCode === 400) {
              shouldCreateNewDiD = true
            }
          })
          .then((json) => {
            if (json?.status === 'fail') {
              shouldCreateNewDiD = true
            }

            if (shouldCreateNewDiD) {
              showModal(
                <ForcedCreateNewAccountModal
                  forcedCreateAccount={forcedCreateAccount}
                  dismissModal={dismissModal}
                  forcedSignOut={forcedSignOut}
                  did={selectedAccount.did}
                />
              )
            }
          })
          .catch((error) => {
            sentry.captureException(error)
          })
      }
    }
    const tid = setTimeout(() => {
      checkForcedCreateAccount()
    }, 1000) // debounce check

    return () => {
      clearTimeout(tid)
    }
  }, [
    authenticated,
    dismissModal,
    forcedCreateAccount,
    forcedUpgrade,
    navigationRef,
    selectedAccount,
    showForcedUpgrade,
    showModal,
    forcedSignOut,
  ])

  return null
}

export default MetaServerChecks

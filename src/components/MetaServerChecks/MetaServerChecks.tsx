import { compareVersions } from 'compare-versions'
import { useConfig } from 'features/config'
import React, { useEffect } from 'react'

import AccountManager from 'api/AccountManager'
import { APP_VERSION } from 'constants/application'
import { useAuth } from 'hooks/useAuth'
import { useEmitter } from 'hooks/useEmitter'
import { useModal } from 'hooks/useModal'

import { DIDNonExistentModal } from './DIDNonExistentModal'
import { ForcedCreateNewAccountModal } from './ForcedCreateNewAccountModal'
import { ForcedUpgradeModal } from './ForcedUpgradeModal'

export const MetaServerChecks = () => {
  const { showModal, dismissModal } = useModal()
  const { forcedUpgrade, forcedCreateAccount } = useConfig()
  const { forcedSignOut } = useAuth()

  useEffect(() => {
    const checkForcedUpgrade = () => {
      if (
        forcedUpgrade?.required &&
        compareVersions(APP_VERSION, forcedUpgrade.minVersion) < 0 // Current version < required version
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
          forcedCreateAccount={forcedCreateAccount!}
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

  useEmitter('IDENTITY_NOT_EXIST', () => {
    showModal(<DIDNonExistentModal dismissModal={dismissModal} />)
  })

  return null
}

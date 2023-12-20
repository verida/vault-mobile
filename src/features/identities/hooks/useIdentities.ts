import { logout as logoutAction } from 'features/auth'
import { selectSelectedAccount } from 'features/identities/slice'
import { Logger } from 'features/telemetry'
import { useCallback } from 'react'

import AccountManager from 'api/AccountManager'
import { useAuth } from 'hooks/useAuth'
import { useAppDispatch, useAppSelector } from 'reduxStore/types'

const logger = new Logger('Identities')

export function useIdentities() {
  const { refresh } = useAuth()
  const dispatch = useAppDispatch()
  const selectedAccount = useAppSelector(selectSelectedAccount) // TODO: Use the dedicated hook when available

  const removeIdentities = useCallback(
    async (dids: string[]) => {
      logger.info('Removing identities')
      if (selectedAccount?.did && dids.includes(selectedAccount.did)) {
        logger.debug('Current Identity about to be removed', {
          did: selectedAccount.did,
        })
        dispatch(logoutAction({ did: selectedAccount?.did }))
      }
      logger.debug('Loging out multiple Identities', { dids })
      await AccountManager.getInstance().logout(dids)
      logger.debug('Refreshing following logout')
      await refresh()
      logger.info('Identities removed')
    },
    [dispatch, refresh, selectedAccount?.did]
  )

  return {
    removeIdentities,
  }
}

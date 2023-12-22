import { logout as logoutAction } from 'features/auth'
import { Logger } from 'features/telemetry'
import { useCallback } from 'react'
import { Alert } from 'react-native'

import AccountManager from 'api/AccountManager'
import { useAuth } from 'hooks/useAuth'
import { useAppDispatch } from 'reduxStore/types'

import { useCurrentIdentity } from './useCurrentIdentity'

const logger = new Logger('Identities')

export function useIdentities() {
  const { switchToAccount, refresh } = useAuth()
  const dispatch = useAppDispatch()
  const currentIdentity = useCurrentIdentity()

  const switchIdentity = useCallback(
    async (did: string) => {
      try {
        await switchToAccount(did)
      } catch (error: unknown) {
        logger.error(
          new Error('Error when switching identity in the drawer', {
            cause: error,
          })
        )
        Alert.alert(
          'Error',
          `Unable to switch to the Identity, please try again later.`
        )

        // Switch back to the current account
        if (currentIdentity?.did) {
          try {
            await switchToAccount(currentIdentity.did)
            await refresh()
          } catch (anotherError: unknown) {
            logger.error(
              new Error(
                'Error when switching and refreshing identity back to current one in the drawer',
                {
                  cause: anotherError,
                }
              )
            )
          }
        }
      }
    },
    [currentIdentity?.did, refresh, switchToAccount]
  )

  const removeIdentity = useCallback(
    async (did: string) => {
      logger.info('Removing identity')
      if (did === currentIdentity?.did) {
        logger.debug('Current Identity about to be removed', {
          did: currentIdentity.did,
        })
        dispatch(logoutAction({ did: currentIdentity?.did }))
      }
      logger.debug('Loging out Identity', { did })
      await AccountManager.getInstance().logout([did])
      logger.debug('Refreshing following logout')
      await refresh()
      logger.info('Identity removed', { did })
    },
    [dispatch, refresh, currentIdentity?.did]
  )

  const destroyIdentity = useCallback(
    async (did: string) => {
      // TODO: Use the destroyAccount from Verida SDK

      await removeIdentity(did)
    },
    [removeIdentity]
  )

  return {
    switchIdentity,
    removeIdentity,
    destroyIdentity,
  }
}

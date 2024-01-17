import { Client } from '@verida/client-rn'
import { logout as logoutAction } from 'features/auth'
import { Logger } from 'features/telemetry'
import { emitter } from 'helpers'
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
    async (did: string, revertToCurrentIfFailed = false) => {
      try {
        await switchToAccount(did)
      } catch (error) {
        logger.error(
          new Error('Error when switching identity', {
            cause: error,
          })
        )

        if (!revertToCurrentIfFailed) {
          emitter.emit('IDENTITY_NOT_EXIST', {})
          return
        }

        Alert.alert(
          'Error',
          `Unable to switch to this identity, please try again later.`
        )

        // Switch back to the current account
        if (currentIdentity?.did) {
          try {
            await switchToAccount(currentIdentity.did)
            await refresh()
          } catch (anotherError: unknown) {
            logger.error(
              new Error(
                'Error when switching and refreshing identity back to current one',
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
    async (did: string, nextDidToSwitchTo?: string) => {
      logger.info('Removing identity')
      if (did === currentIdentity?.did) {
        logger.debug('Current Identity about to be removed', {
          did: currentIdentity.did,
        })
        dispatch(logoutAction({ did: currentIdentity?.did }))
      }
      logger.debug('Loging out Identity', { did })
      await AccountManager.getInstance().logout([did], nextDidToSwitchTo)
      logger.debug('Refreshing following logout')
      await refresh()
      logger.info('Identity removed', { did })
    },
    [dispatch, refresh, currentIdentity?.did]
  )

  /**
   * Due to the structure of the Verida SDK, we have to pass a client connected with an account and but as we don't have access to the connected account from the client, we also need the corresponding DID in argument to go one with the destroy flow.
   *
   * This method will trigger the log out of the DID and potentially the switch to a different Identity if the DID is the current Identity.
   */
  const destroyIdentity = useCallback(
    async (client: Client, did: string, nextDidToSwitchTo?: string) => {
      await client.destroyAccount()
      await removeIdentity(did, nextDidToSwitchTo)
    },
    [removeIdentity]
  )

  return {
    switchIdentity,
    removeIdentity,
    destroyIdentity,
  }
}

import { useFocusEffect } from '@react-navigation/native'
import { isCryptoRequestDeepLink } from 'features/cryptoWallet'
import { useDeeplink } from 'features/deepLinks'
import { isPolygonIdMessage } from 'features/polygonid'
import { Logger } from 'features/telemetry'
import { useCallback, useEffect } from 'react'
import { Linking } from 'react-native'

import { fetchInboxCount } from 'api/utils'

const logger = Logger.create('HomeScreen')

/**
 * This is a temporary hooks to migrate all the handlers that used to be set on the previous home screen. The logic here is not related to the Home screen, so should be moved to an appropriate location.
 * @deprecated
 */
export function useHomeScreenHandlers() {
  // ##### Deep Links #####

  // TODO: Clean up and migrate all the deeplink handlers here to their respective features/protocols
  const handleDeeplink = useDeeplink()

  const processDeepLink = useCallback(
    (initialUrl) => {
      if (initialUrl === null) {
        return
      }

      // Ignore PolygonID deeplink here, as it's handled in features/protocolHandlers
      if (
        isPolygonIdMessage(initialUrl) ||
        isCryptoRequestDeepLink(initialUrl)
      ) {
        return
      }

      // ignore for firebase links, let firebase handle them.
      if (
        initialUrl.includes('redirect') ||
        initialUrl.includes('verida.page.link')
      ) {
        return
      }

      handleDeeplink(initialUrl)
    },
    [handleDeeplink]
  )

  useEffect(() => {
    const getUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL()
        processDeepLink(initialUrl)
      } catch (error) {
        logger.error(error)
      }
    }

    getUrl()
  }, [processDeepLink])

  useEffect(() => {
    const handleBackgroundDeepLink = async (event: { url: string }) => {
      try {
        const initialUrl = event.url
        processDeepLink(initialUrl)
      } catch (error) {
        logger.error(error)
      }
    }

    const subscriber = Linking.addEventListener('url', handleBackgroundDeepLink)
    return () => {
      subscriber?.remove()
    }
  }, [processDeepLink])

  // ##### Inbox #####

  // TODO: remove, and refactor the inbox count feature
  useFocusEffect(
    useCallback(() => {
      fetchInboxCount()
    }, [])
  )
}

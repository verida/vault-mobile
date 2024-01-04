import dynamicLinks from '@react-native-firebase/dynamic-links'
import { useFocusEffect, useLinkTo } from '@react-navigation/native'
import { isCryptoRequestDeepLink } from 'features/cryptoWallet'
import { useDeeplink } from 'features/deepLinks'
import {
  selectNavigationLink,
  setNavigationLink as setNavigationLinkAction,
} from 'features/links'
import { isPolygonIdMessage } from 'features/polygonid'
import { Logger } from 'features/telemetry'
import { useCallback, useEffect } from 'react'
import { InteractionManager, Linking } from 'react-native'
import parse from 'url-parse'

import { fetchInboxCount } from 'api/utils'
import { useAppDispatch, useAppSelector } from 'reduxStore/types'

const logger = new Logger('HomeScreen')

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

  // ##### Navigation Links #####

  const dispatch = useAppDispatch()

  const navigationLink = useAppSelector(selectNavigationLink)

  const setNavigationLink = useCallback(
    (link) => dispatch(setNavigationLinkAction(link)),
    [dispatch]
  )

  const linkTo = useLinkTo()

  useEffect(() => {
    if (navigationLink) {
      InteractionManager.runAfterInteractions(() => {
        linkTo(navigationLink)
        setNavigationLink(null)
      })
    }
  }, [navigationLink, linkTo, setNavigationLink])

  // ##### Dynamic Links? #####

  useEffect(() => {
    // TODO: Find out what's going on here :-/
    dynamicLinks()
      .getInitialLink()
      .then(async (link) => {
        if (link?.url?.includes('redirect')) {
          try {
            const parsedUrl = parse(link.url, true)
            const { query } = parsedUrl
            await Linking.openURL(
              'https://www.google.com/search?q=' + query.keyword
            )
          } catch (error) {
            logger.error(error)
          }
        }
      })
  }, [])

  // ##### Inbox #####

  // TODO: remove, and refactor the inbox count feature
  useFocusEffect(
    useCallback(() => {
      fetchInboxCount()
    }, [])
  )
}

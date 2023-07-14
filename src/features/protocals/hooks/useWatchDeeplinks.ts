import * as Sentry from '@sentry/react-native'
import { useEffect } from 'react'
import { Linking } from 'react-native'

import { useProtocalsHandlers } from './useProtocalHandlers'

export function useWatchDeeplinks() {
  const { processDeeplink } = useProtocalsHandlers()

  useEffect(() => {
    const getUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL()
        if (initialUrl) {
          processDeeplink(initialUrl!)
        }
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    getUrl()
  }, [processDeeplink])

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      try {
        const initialUrl = event.url
        processDeeplink(initialUrl)
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    Linking.addEventListener('url', handleDeepLink)
  }, [processDeeplink])
}

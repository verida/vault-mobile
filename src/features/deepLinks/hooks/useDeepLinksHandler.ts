import messaging from '@react-native-firebase/messaging'
import { useProtocols } from 'features/protocols'
import { Logger } from 'features/telemetry'
import { useEffect } from 'react'
import { Linking } from 'react-native'

const logger = new Logger('DeepLinks')

export function useDeepLinksHandler() {
  const { processDeepLink } = useProtocols()

  // For when the application is opened from a quit state
  useEffect(() => {
    const processInitialUrl = async () => {
      // Get the deep link that opened the app, if any
      const url = await Linking.getInitialURL()
      if (url) {
        // No need to try/catch has handled in processDeepLink and Linking.getInitialURL is assumed to not throw errors
        processDeepLink(url)
        // TODO: When all deep links are handled by this protocol handlers, get the result of the process, and if not processed, display something to the user.
      }

      // Or
      // Get the Firebase notification that opened the app, if any
      const message = await messaging().getInitialNotification()
      if (message) {
        // TODO: If we start adding deep links to Firebase notifications, we can extract them and process them here
        logger.debug('Firebase initial notification', { message })
      }
    }

    processInitialUrl()
  }, [processDeepLink])

  // For when the application is running, but in the background
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      // No need to try/catch has handled in processDeepLink
      processDeepLink(url)
      // TODO: When all deep links are handled by this protocol handlers, get the result of the process, and if not processed, display something to the user.
    }

    // Listen to incoming links from deep linking
    const subscriber = Linking.addEventListener('url', handleDeepLink)

    // Listen to Firebase notifications that opened the app
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      logger.debug('Firebase notification opened', {
        message: remoteMessage,
      })
    })

    return () => {
      subscriber.remove()
      unsubscribe()
    }
  }, [processDeepLink])
}

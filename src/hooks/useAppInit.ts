import * as SplashScreen from 'expo-splash-screen'
import { requestNotificationPermission } from 'features/notifications'
import { Logger } from 'features/telemetry'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useFonts } from 'styles'

const logger = new Logger('App')

export function useAppInit() {
  const [initialised, setInitialised] = useState(false)

  const { loadFonts } = useFonts()

  useEffect(() => {
    const init = async () => {
      try {
        await SplashScreen.preventAutoHideAsync()

        // Add any app initialization logic from hooks here
        await loadFonts()

        await SplashScreen.hideAsync()

        setInitialised(true)
      } catch (error) {
        logger.error(
          new Error('Application failed to initialise', { cause: error })
        )
        Alert.alert(
          'Error',
          'The application failed to initialize properly. Try again later.'
        )
      }
    }

    init()
  }, [loadFonts])

  useEffect(() => {
    const tid = setTimeout(() => {
      requestNotificationPermission()
    }, 1000)

    return () => {
      clearTimeout(tid)
    }
  }, [])

  return {
    initialised,
  }
}

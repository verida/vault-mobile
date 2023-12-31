import messaging from '@react-native-firebase/messaging'
import { selectSelectedAccount } from 'features/identities'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { registerRemoteNotification } from '../api'

export function useRemoteNotifications() {
  const selectedAccount = useSelector(selectSelectedAccount)

  useEffect(() => {
    async function init() {
      if (!selectedAccount) {
        return
      }

      const registered = messaging().isDeviceRegisteredForRemoteMessages
      if (!registered) {
        await messaging().registerDeviceForRemoteMessages()
      }
      const token = await messaging().getToken()
      await registerRemoteNotification(token)
    }

    // This is to prevent the push notification initialize many times
    // TODO: Refactor the organization of app navigation to fix this instead
    const tid = setTimeout(() => {
      init()
    }, 300)

    return () => clearTimeout(tid)
  }, [selectedAccount])
}

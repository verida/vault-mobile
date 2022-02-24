import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { registerRemoteNotification } from 'api/utils'

export function useRemoteNotifications() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const selectedAccount = useSelector((state) => state.selectedAccount)

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

    init()
  }, [selectedAccount])
}

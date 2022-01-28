import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'
import { Alert } from 'react-native'
import { fetchInboxCount, registerRemoteNotification } from 'api/utils'
import { useSelector } from 'react-redux'
import PushNotification from 'react-native-push-notification'

export function useRemoteNotifications() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const selectedAccount = useSelector((state) => state.selectedAccount)

  useEffect(() => {
    async function init() {
      const registered = messaging().isDeviceRegisteredForRemoteMessages
      if (!registered) {
        await messaging().registerDeviceForRemoteMessages()
      }
      const token = await messaging().getToken()
      await registerRemoteNotification(token)
    }

    init()

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('remoteMessge:', remoteMessage)
      Alert.alert('Remote notification', JSON.stringify(remoteMessage))
      await fetchInboxCount()
    })

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('background message:', remoteMessage)
      PushNotification.localNotification({
        title: 'Test',
        message: 'Test',
      })
    })

    return unsubscribe
  }, [selectedAccount])
}

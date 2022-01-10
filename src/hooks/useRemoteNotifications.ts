import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'
import { Alert } from 'react-native'
import { useRegisterRemoteNotification } from 'hooks/useRegisterRemoteNotification'
import { registerRemoteNotification } from 'api/utils'

export function useRemoteNotifications() {
  useRegisterRemoteNotification()

  useEffect(() => {
    async function init() {
      await messaging().registerDeviceForRemoteMessages()
      const registered = messaging().isDeviceRegisteredForRemoteMessages
      console.log('registered:', registered)
      const token = await messaging().getToken()
      console.log('apns token:', token)
      await registerRemoteNotification(token)
    }

    init()

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('remoteMessage:', remoteMessage)
      Alert.alert('Remote notification', JSON.stringify(remoteMessage))
    })

    return unsubscribe
  }, [])
}

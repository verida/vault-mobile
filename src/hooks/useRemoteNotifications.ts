import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'
import { Alert } from 'react-native'
import { useRegisterRemoteNotification } from 'hooks/useRegisterRemoteNotification'

export function useRemoteNotifications() {
  useRegisterRemoteNotification()

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('remoteMessage:', remoteMessage)
      Alert.alert('Remote notification', JSON.stringify(remoteMessage))
    })

    return unsubscribe
  }, [])
}

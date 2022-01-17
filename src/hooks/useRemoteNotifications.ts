import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'
import { Alert } from 'react-native'

export function useRemoteNotifications() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('Remote notification', JSON.stringify(remoteMessage))
    })

    return unsubscribe
  }, [])
}

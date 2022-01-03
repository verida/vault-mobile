import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react'

export function useRemoteNotifications() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('remoteMessage:', remoteMessage)
    })

    return unsubscribe
  }, [])
}

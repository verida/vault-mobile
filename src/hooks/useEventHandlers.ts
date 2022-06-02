import NetInfo from '@react-native-community/netinfo'
import fbMessaging from '@react-native-firebase/messaging'
import * as Sentry from '@sentry/react-native'
import { CHANNEL_ID } from 'helpers/notifications'
import { get } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import PushNotification from 'react-native-push-notification'
import { useDispatch, useSelector } from 'react-redux'

import AccountManager from 'api/AccountManager'
import { fetchInboxCount } from 'api/utils'
import DataConnectorsManager from 'api/DataConnectorsManager'

export const useEventHandlers = () => {
  const isNetworkConnected = useRef<boolean | null>(null)
  const appState = useRef(AppState.currentState)
  const [ready, setReady] = useState(false)
  const dispatch = useDispatch()
  const isConnectingRef = useRef(false)
  const latestNotificationRef = useRef<any>(null)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const selectedAccount = useSelector((state) => state.main.selectedAccount)

  const onMessage = useCallback(async function onMessage(_message: any) {
    // TODO: enable this when we make inbox.onMessage works faster and reliably. Now using firebase.messaging.onMessage to handle it
    // await fetchInboxCount()
    // PushNotification.localNotification({
    //   title: get(message, 'sendBy.app') || 'New Message',
    //   message: message.message,
    //   channelId: CHANNEL_ID,
    //   userInfo: {
    //     category: 'InboxItem',
    //     data: message,
    //   },
    // })
  }, [])

  useEffect(() => {
    async function disconnect() {
      const messaging =
        await AccountManager.getInstance().vault?.inbox.getMessaging()
      await messaging.offMessage(onMessage)
      isConnectingRef.current = false
    }

    async function reInitMessaging() {
      try {
        if (isConnectingRef.current) {
          return
        }
        isConnectingRef.current = true

        const messaging =
          await AccountManager.getInstance().vault?.inbox.getMessaging()
        await messaging.offMessage(onMessage)
        await messaging.onMessage(onMessage)

        await fetchInboxCount()

        isConnectingRef.current = false
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    async function init() {
      DataConnectorsManager.triggerSync()

      const fbUnsubscribe = fbMessaging().onMessage(async () => {
        try {
          await fetchInboxCount()
          const msgs =
            await AccountManager.getInstance().vault?.inbox.fetchLatest(
              { read: false },
              { limit: 1 }
            )
          const latestMessage = msgs?.[0]
          // In case inbox is slow and hasn't loaded with latest message then ignore
          if (
            !latestMessage ||
            latestNotificationRef.current?._id === latestMessage?._id
          ) {
            return
          }

          latestNotificationRef.current = latestMessage
          PushNotification.localNotification({
            title: get(latestMessage, 'sendBy.app') || 'New Message',
            message: latestMessage.message,
            channelId: CHANNEL_ID,
            userInfo: {
              category: 'InboxItem',
              data: latestMessage.message,
            },
          })
        } catch (error) {
          Sentry.captureException(error)
        }
      })

      async function onAppStateChanged(nextAppState: AppStateStatus) {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          await reInitMessaging()
        }

        DataConnectorsManager.triggerSync()

        appState.current = nextAppState
      }

      const unsubscribeNetInfo = NetInfo.addEventListener(async (state) => {
        // Reconnect from disconnected state
        if (isNetworkConnected.current === false && state.isConnected) {
          await reInitMessaging()
        }
        isNetworkConnected.current = state.isConnected
      })

      const messaging =
        await AccountManager.getInstance().vault?.inbox.getMessaging()
      await messaging.onMessage(onMessage)
      AppState.addEventListener('change', onAppStateChanged)

      return async () => {
        AppState.removeEventListener('change', onAppStateChanged)
        unsubscribeNetInfo?.()
        fbUnsubscribe?.()

        await disconnect()
      }
    }

    let unsubscribe: () => void
    init().then((_unsubscribe) => {
      unsubscribe = _unsubscribe
      setReady(true)
    })

    return () => {
      unsubscribe && unsubscribe()
    }
  }, [dispatch, onMessage, selectedAccount])

  return {
    ready,
  }
}

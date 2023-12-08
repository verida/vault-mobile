import NetInfo from '@react-native-community/netinfo'
import fbMessaging from '@react-native-firebase/messaging'
import { selectSelectedAccount } from 'features/identities'
import {
  DEFAULT_INBOX_MESSAGE_NOTIFICATION_MESSAGE,
  DEFAULT_INBOX_MESSAGE_NOTIFICATION_TITLE,
  MESSAGE_NOTIFICATION_CHANNEL_ID,
  NOTIFICATION_CATEGORY,
} from 'features/notifications'
import { Logger } from 'features/telemetry'
import { get } from 'lodash'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import PushNotification from 'react-native-push-notification'
import { useDispatch, useSelector } from 'react-redux'
import { useThrottledCallback } from 'use-debounce'

import AccountManager from 'api/AccountManager'
import DataConnectorsManager from 'api/DataConnectorsManager'
import { fetchInboxCount } from 'api/utils'

const logger = new Logger('EventHandler')

export const useEventHandlers = () => {
  const isNetworkConnected = useRef<boolean | null>(null)
  const appState = useRef(AppState.currentState)
  const [ready, setReady] = useState(false)
  const dispatch = useDispatch()
  const isConnectingRef = useRef(false)
  const latestNotificationRef = useRef<any>(null)

  const selectedAccount = useSelector(selectSelectedAccount)

  const onMessage = useThrottledCallback(
    React.useCallback(async function onMessage(newMessage: any) {
      await fetchInboxCount()
      if (
        !newMessage ||
        // Duplicated message, just ignore
        latestNotificationRef.current?._id === newMessage?._id
      ) {
        return
      }

      latestNotificationRef.current = newMessage
      PushNotification.localNotification({
        title:
          get(newMessage, 'sendBy.app') ||
          DEFAULT_INBOX_MESSAGE_NOTIFICATION_TITLE,
        message:
          newMessage.message || DEFAULT_INBOX_MESSAGE_NOTIFICATION_MESSAGE,
        channelId: MESSAGE_NOTIFICATION_CHANNEL_ID,
        userInfo: {
          category: NOTIFICATION_CATEGORY.NEW_INBOX_MESSAGE,
          data: newMessage.message,
        },
      })
    }, []),
    500
  )

  useEffect(() => {
    async function disconnect() {
      const messaging =
        await AccountManager.getInstance().vault?.inbox.getMessaging()
      await messaging?.offMessage(onMessage)
      isConnectingRef.current = false
    }

    async function initInboxMessaging() {
      try {
        if (isConnectingRef.current) {
          return
        }
        isConnectingRef.current = true

        const messaging =
          await AccountManager.getInstance().vault?.inbox.getMessaging()
        await messaging?.offMessage(onMessage)
        await messaging?.onMessage(onMessage)

        await fetchInboxCount()
        isConnectingRef.current = false
      } catch (error) {
        logger.error(error)
      }
    }

    async function init() {
      DataConnectorsManager.triggerSync()

      // Enhance the inbox messaging with Firebase Push Notification event
      // So in case the inbox is slow to receive events we have a backoff
      const fbUnsubscribe = fbMessaging().onMessage(async () => {
        try {
          const msgs =
            await AccountManager.getInstance().vault?.inbox.fetchLatest(
              { read: false },
              { limit: 1 }
            )
          const latestMessage = msgs?.[0]

          onMessage(latestMessage)
        } catch (error) {
          logger.error(error)
        }
      })

      initInboxMessaging()
      async function onAppStateChanged(nextAppState: AppStateStatus) {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          await initInboxMessaging()
        }

        DataConnectorsManager.triggerSync()

        appState.current = nextAppState
      }

      const unsubscribeNetInfo = NetInfo.addEventListener(async (state) => {
        // Reconnect from disconnected state
        if (isNetworkConnected.current === false && state.isConnected) {
          await initInboxMessaging()
        }
        isNetworkConnected.current = state.isConnected
      })

      const appStateSubscriber = AppState.addEventListener(
        'change',
        onAppStateChanged
      )

      return async () => {
        appStateSubscriber?.remove()
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

import { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import AccountManager from 'api/AccountManager'
import PushNotification from 'react-native-push-notification'
import { get } from 'lodash'
import { CHANNEL_ID } from 'helpers/notifications'
import * as Sentry from '@sentry/react-native'
import { useDispatch } from 'react-redux'
import { setNewMessagesCount } from 'reduxStore/general/actions'
import NetInfo from '@react-native-community/netinfo'

const MAX_MESSAGE_COUNT = 21

export const useEventHandlers = () => {
  const isNetworkConnected = useRef<boolean | null>(null)
  const appState = useRef(AppState.currentState)
  const [ready, setReady] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    async function fetchInboxCount() {
      try {
        const messages =
          await AccountManager.getInstance().vault?.inbox.fetchLatest(
            { read: false },
            { limit: MAX_MESSAGE_COUNT }
          )
        dispatch(setNewMessagesCount(messages.length))
      } catch (error) {
        Sentry.captureException(error)
        console.log(error)
      }
    }

    function onMessage(message) {
      console.log('message:', message)
      fetchInboxCount()
      PushNotification.localNotification({
        title: get(message, 'sendBy.app') || 'New Message',
        message: message.message,
        channelId: CHANNEL_ID,
        userInfo: {
          category: 'InboxItem',
          data: message,
        },
      })
    }

    async function init() {
      const messaging =
        await AccountManager.getInstance().vault?.inbox.getMessaging()
      console.log('messaging:', messaging)
      let messagingSubscription = messaging.onMessage(onMessage)

      async function onAppStateChanged(nextAppState: AppStateStatus) {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          await fetchInboxCount()
          // messagingSubscription &&
          //   messagingSubscription.removeListener('newMessage', onMessage)
          messagingSubscription = messaging.onMessage(onMessage)
        }

        appState.current = nextAppState
      }

      const unsubscribeNetInfo = NetInfo.addEventListener(async (state) => {
        // Reconnect from disconnected state
        if (isNetworkConnected.current === false && state.isConnected) {
          await fetchInboxCount()
          // messagingSubscription &&
          //   messagingSubscription.removeListener('newMessage', onMessage)
          messagingSubscription = messaging.onMessage(onMessage)
        }
        isNetworkConnected.current = state.isConnected
      })

      AppState.addEventListener('change', onAppStateChanged)

      return () => {
        // messagingSubscription &&
        //   messagingSubscription.removeListener('newMessage', onMessage)
        unsubscribeNetInfo && unsubscribeNetInfo()
        AppState.removeEventListener('change', onAppStateChanged)
      }
    }

    let unsubscribe: () => void
    init().then((_unsubscribe) => {
      unsubscribe = _unsubscribe
      setReady(true)
    })

    return () => unsubscribe && unsubscribe()
  }, [dispatch])

  return {
    ready,
  }
}

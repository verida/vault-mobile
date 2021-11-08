import { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import AccountManager from 'api/AccountManager'
import PushNotification from 'react-native-push-notification'
import { get } from 'lodash'
import { CHANNEL_ID } from 'helpers/notifications'
import { useDispatch, useSelector } from 'react-redux'
import NetInfo from '@react-native-community/netinfo'
import { fetchInboxCount } from 'api/utils'

export const useEventHandlers = () => {
  const isNetworkConnected = useRef<boolean | null>(null)
  const appState = useRef(AppState.currentState)
  const [ready, setReady] = useState(false)
  const dispatch = useDispatch()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const selectedAccount = useSelector((state) => state.selectedAccount)

  useEffect(() => {
    async function onMessage(message: any) {
      await fetchInboxCount()
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

    async function reInitMessaging() {
      try {
        const messaging =
          await AccountManager.getInstance().vault?.inbox.getMessaging()
        await messaging.offMessage(onMessage)
        await messaging.onMessage(onMessage)
        await fetchInboxCount()
      } catch (e) {
        console.error(e)
      }
    }

    async function init() {
      async function onAppStateChanged(nextAppState: AppStateStatus) {
        console.log('onAppStateChanged')
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          await reInitMessaging()
        }

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
      await messaging.offMessage(onMessage)
      await messaging.onMessage(onMessage)
      AppState.addEventListener('change', onAppStateChanged)

      return async () => {
        const _messaging =
          await AccountManager.getInstance().vault?.inbox.getMessaging()
        await _messaging.offMessage(onMessage)
        unsubscribeNetInfo && unsubscribeNetInfo()
        AppState.removeEventListener('change', onAppStateChanged)
      }
    }

    let unsubscribe: () => void
    init().then((_unsubscribe) => {
      unsubscribe = _unsubscribe
      setReady(true)
    })

    return () => {
      console.log('unsubscribe')
      unsubscribe && unsubscribe()
    }
  }, [dispatch, selectedAccount])

  return {
    ready,
  }
}

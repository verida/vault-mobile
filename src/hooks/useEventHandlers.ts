import NetInfo from '@react-native-community/netinfo'
import { selectSelectedAccount } from 'features/identities'
import { pushNewMessageNotification } from 'features/notifications'
import { Logger } from 'features/telemetry'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useThrottledCallback } from 'use-debounce'

import AccountManager from 'api/AccountManager'
import DataConnectorsManager from 'api/DataConnectorsManager'
import { fetchInboxCount } from 'api/utils'

const logger = Logger.create('EventHandler')

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
      // TODO: Validate the message with zod, so it is properly typed
      await fetchInboxCount()
      if (
        !newMessage ||
        // Duplicated message, just ignore
        latestNotificationRef.current?._id === newMessage?._id
      ) {
        return
      }

      latestNotificationRef.current = newMessage
      pushNewMessageNotification(newMessage)
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

      initInboxMessaging()
      async function onAppStateChanged(nextAppState: AppStateStatus) {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          await initInboxMessaging()
        } else if (
          appState.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          await disconnect()
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

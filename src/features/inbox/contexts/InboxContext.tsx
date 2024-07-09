import {
  addEventListener,
  fetch as fetchNetInfo,
  refresh as refreshNetworkInfo,
} from '@react-native-community/netinfo'
import { isEmpty } from 'lodash'
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { AppState, AppStateStatus } from 'react-native'
import RNRestart from 'react-native-restart'
import { useDispatch, useSelector } from 'react-redux'
import { useThrottledCallback } from 'use-debounce'

import AccountManager from '~/api/AccountManager'
import DataConnectorsManager from '~/api/DataConnectorsManager'
import { fetchInboxCount } from '~/api/utils'
import { selectSelectedAccount } from '~/features/identities'
import { pushNewMessageNotification } from '~/features/notifications'
import { Logger } from '~/features/telemetry'

const logger = Logger.create('InboxProvider')

interface InboxContextType {
  connected: boolean
}

const InboxContext = createContext<InboxContextType | undefined>(undefined)

export const InboxProvider: React.FC = ({ children }) => {
  const [connected, setConnected] = useState(true)
  const [loading, setLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [timeInBackground, setTimeInBackground] = useState(0)

  const isNetworkConnected = useRef<boolean | null>(null)
  const appState = useRef(AppState.currentState)
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

  const maxRetryThreshold = 10
  const healthCheck = useThrottledCallback(
    useCallback(async () => {
      if (loading) return
      try {
        setLoading(true)
        // At the 3rd retry time, try to init Inbox DBs again
        if (retryCount === 3) {
          logger.info('Try to init the inbox again')
          await AccountManager.getInstance().vault?.inbox.rebuild()
        }

        const info =
          await AccountManager.getInstance().vault?.inbox.healthCheck()

        if (!isEmpty(info?.privateDb) && !isEmpty(info?.publicDb)) {
          setConnected(true)
          setRetryCount(0)
        }
      } catch (error) {
        if (retryCount > maxRetryThreshold) {
          logger.info(
            'Could not connect to the Inbox, the app needs to restart'
          )
          RNRestart.restart()
          return
        }

        setRetryCount((cur) => cur + 1)
      } finally {
        setLoading(false)
      }
    }, [loading, retryCount]),
    1000
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

      // Handle app state change
      async function onAppStateChanged(nextAppState: AppStateStatus) {
        const messaging =
          await AccountManager.getInstance().vault?.inbox.getMessaging()
        const inbox = await messaging.getInbox()
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          logger.info(`timeInBackground: ${Date.now() - timeInBackground}`)

          // Soft restart the inbox in case the Wallet was put in the background for too long  for sure(over 60 seconds)
          // Rebuild the inbox usually does not work in this case on testing
          if (Date.now() - timeInBackground > 60 * 60 * 60) {
            logger.info(
              'The app is in the background for too long, do a soft restart'
            )
            RNRestart.restart()
            return
          } // Rebuild the inbox in case the Wallet was put in the background for too long(over 30 seconds and iOS destroys the active connections)
          else if (Date.now() - timeInBackground > 30 * 60 * 60) {
            logger.info('Try to init the inbox again')
            await AccountManager.getInstance().vault?.inbox.rebuild()
          }

          setTimeInBackground(0)
          healthCheck()
          initInboxMessaging()
          // Listen for the inbox event that failed to connect from the SDK, and active the health check
          inbox.on('INBOX_FAILED_TO_CONNECT', healthCheck)
        } else if (
          appState.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          disconnect()
          inbox.removeListener('INBOX_FAILED_TO_CONNECT', healthCheck)
          setTimeInBackground(Date.now())
        }

        initInboxMessaging()
        DataConnectorsManager.triggerSync()
        appState.current = nextAppState
      }

      const unsubscribeNetInfo = addEventListener(async (state) => {
        // Reconnect from disconnected state
        if (state.isConnected) {
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
        disconnect()
      }
    }

    let unsubscribe: () => void
    init().then((_unsubscribe) => {
      unsubscribe = _unsubscribe
    })

    return () => {
      unsubscribe?.()
    }
  }, [dispatch, healthCheck, onMessage, selectedAccount, timeInBackground])

  useEffect(() => {
    // For now keep checking the internet connection and inbox heath at the interval
    // TODO: find a better way
    const tid = setInterval(
      async () => {
        await refreshNetworkInfo()
        const state = await fetchNetInfo()
        setConnected(state.isConnected ?? false)
        healthCheck()
      },
      connected ? 12 * 1000 : 2 * 1000 // Faster the interval check when not connected
    )

    return () => {
      clearInterval(tid)
    }
  }, [connected, healthCheck])

  return (
    <InboxContext.Provider value={{ connected }}>
      {children}
    </InboxContext.Provider>
  )
}

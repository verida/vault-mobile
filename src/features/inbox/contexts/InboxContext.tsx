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
import { useDebouncedCallback, useThrottledCallback } from 'use-debounce'

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

  const healthCheck = useDebouncedCallback(
    useCallback(async () => {
      if (loading) return
      try {
        setLoading(true)
        const info =
          await AccountManager.getInstance().vault?.inbox.healthCheck()

        if (!isEmpty(info?.privateDb) && !isEmpty(info?.publicDb)) {
          setConnected(true)
          setRetryCount(0)
        }

        console.log('INFO', JSON.stringify(info?.privateDb, null, 2))
      } catch (error) {
        if (retryCount > 10) {
          logger.info('Could not connect the Inbox, the app needs to restart')
          RNRestart.restart()
          return
        }

        setTimeout(() => {
          setRetryCount((cur) => cur + 1)
        }, 1200)
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
      async function onAppStateChanged(nextAppState: AppStateStatus) {
        const onFailedToConnect = () => {
          healthCheck()
        }

        const messaging =
          await AccountManager.getInstance().vault?.inbox.getMessaging()
        const inbox = await messaging.getInbox()
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          logger.info(`timeInBackground: ${Date.now() - timeInBackground}`)
          // Restart in case the Wallet was put in the background for too long
          // TODO: remove this once we have a reliable way to reconnect the inbox without restating the app
          if (Date.now() - timeInBackground > 30 * 60 * 60) {
            RNRestart.restart()
            return
          } else {
            setTimeInBackground(0)
          }

          healthCheck()
          await initInboxMessaging()
          inbox.on('RESTART_INBOX', onFailedToConnect)
        } else if (
          appState.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          await disconnect()
          inbox.removeListener('RESTART_INBOX', onFailedToConnect)
          setTimeInBackground(Date.now())
        }

        await initInboxMessaging()

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

        await disconnect()
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
    // For now keep checking the internet connection and inbox heath
    // TODO: find a better way
    const tid = setInterval(
      async () => {
        await refreshNetworkInfo()
        const state = await fetchNetInfo()
        setConnected(state.isConnected ?? false)
        healthCheck()
      },
      connected ? 12000 : 1000
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

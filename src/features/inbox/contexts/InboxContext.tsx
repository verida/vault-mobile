import {
  addEventListener as addNetworkEventListener,
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
import { useSelector } from 'react-redux'
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
  const [inboxConnected, setInboxConnected] = useState(true)
  const [loading, setLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [timeInBackground, setTimeInBackground] = useState(0)

  const isNetworkConnected = useRef<boolean | null>(null)
  const appState = useRef(AppState.currentState)
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

  const initInboxMessaging = useCallback(async () => {
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
  }, [onMessage])

  const disconnect = useCallback(async () => {
    const messaging =
      await AccountManager.getInstance().vault?.inbox.getMessaging()
    await messaging?.offMessage(onMessage)
    isConnectingRef.current = false
  }, [onMessage])

  const maxRetryThreshold = 10

  const healthCheck = useThrottledCallback(
    useCallback(async () => {
      if (loading) {
        return
      }

      if (isNetworkConnected.current === false) {
        return
      }

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
          setInboxConnected(true)
          setRetryCount(0)
        } else {
          setInboxConnected(false)
          setRetryCount((cur) => cur + 1)
        }
      } catch (error) {
        if (retryCount > maxRetryThreshold) {
          logger.info(
            'Could not connect to the Inbox, the app needs to restart'
          )

          RNRestart.restart()
          // TODO: Try alternatives to restarting the app
          // await AccountManager.getInstance().vault?.inbox.rebuild()
          //  - Apparently doesn't always work
          // await AccountManager.getInstance().vault?.inbox.init(true)
          //  - To try
          // await AccountManager.getInstance().connect(true, '')
          //  - To try
          // await init()

          return
        }

        setInboxConnected(false)
        setRetryCount((cur) => cur + 1)
      } finally {
        setLoading(false)
      }
    }, [loading, retryCount]),
    1000
  )

  const onAppStateChanged = useCallback(
    async (nextAppState: AppStateStatus) => {
      const messaging =
        await AccountManager.getInstance().vault?.inbox.getMessaging()
      const inbox = await messaging.getInbox()
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        logger.debug(`timeInBackground: ${Date.now() - timeInBackground}`)

        // Soft restart the inbox in case the Wallet was put in the background for too long  for sure(over 60 seconds)
        // Rebuild the inbox usually does not work in this case on testing
        if (Date.now() - timeInBackground > 60 * 60 * 60) {
          logger.info(
            'The app is in the background for too long, do a soft restart'
          )

          RNRestart.restart()
          // TODO: Try alternatives to restarting the app
          // await AccountManager.getInstance().vault?.inbox.rebuild()
          //  - Apparently doesn't always work
          // await AccountManager.getInstance().vault?.inbox.init(true)
          //  - To try
          // await AccountManager.getInstance().connect(true, '')
          //  - To try
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
      DataConnectorsManager.triggerSync() // TODO: Move it back into the useEventHandlers.ts
      appState.current = nextAppState
    },
    [disconnect, healthCheck, initInboxMessaging, timeInBackground]
  )

  const init = useCallback(async () => {
    logger.debug('Initialising the inbox for account', {
      account: selectedAccount,
    })
    DataConnectorsManager.triggerSync() // TODO: Move it back into the useEventHandlers.ts
    initInboxMessaging()

    const unsubscribeNetInfo = addNetworkEventListener(async (state) => {
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
  }, [disconnect, initInboxMessaging, selectedAccount, onAppStateChanged])

  useEffect(() => {
    let unsubscribe: () => void
    init().then((_unsubscribe) => {
      unsubscribe = _unsubscribe
    })

    return () => {
      unsubscribe?.()
    }
  }, [init])

  useEffect(() => {
    // For now keep checking the internet connection and inbox heath at the interval
    // TODO: find a better way
    const tid = setInterval(
      async () => {
        // TODO: Don't check the inbox health when there is no ntework connection
        logger.debug('Checking the internet connection and inbox health')
        await refreshNetworkInfo()
        const state = await fetchNetInfo()
        isNetworkConnected.current = state.isConnected
        healthCheck()
      },
      inboxConnected ? 12 * 1000 : 2 * 1000 // Faster the interval check when not connected
    )

    return () => {
      clearInterval(tid)
    }
  }, [inboxConnected, healthCheck])

  return (
    <InboxContext.Provider value={{ connected: inboxConnected }}>
      {children}
    </InboxContext.Provider>
  )
}

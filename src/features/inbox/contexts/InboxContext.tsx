import {
  addEventListener,
  fetch as fetchNetInfo,
  refresh,
} from '@react-native-community/netinfo'
import { isEmpty } from 'lodash'
import React, {
  createContext,
  useCallback,
  useContext,
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

// Define types for inbox item and context state
interface InboxItem {
  id: string
  subject: string
  content: string
  read: boolean
}

interface InboxContextType {
  inboxItems: InboxItem[]
  markAsRead: (id: string) => void
}

// Create the context
const InboxContext = createContext<InboxContextType | undefined>(undefined)

export const InboxProvider: React.FC = ({ children }) => {
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([])
  const [connected, setConnected] = useState(true)
  const [loading, setLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const healthCheck = useDebouncedCallback(
    useCallback(async () => {
      if (loading) return

      console.log('Health Check')

      try {
        setLoading(true)
        const info =
          await AccountManager.getInstance().vault?.inbox.healthCheck()

        if (!isEmpty(info?.privateDb) && !isEmpty(info?.publicDb)) {
          setConnected(true)
          setRetryCount(0)
        }

        console.log('INFO', JSON.stringify(info, null, 2))
      } catch (error) {
        console.log('Error', retryCount, error)
        if (retryCount > 10) {
          console.log('Need to restart')
          RNRestart.restart()
        }

        setTimeout(() => {
          setRetryCount((cur) => cur + 1)
        }, 1000)
      } finally {
        setLoading(false)
      }
    }, [loading, retryCount]),
    200
  )

  // Example: Fetch inbox items (you may load from AsyncStorage or an API)
  useEffect(() => {
    const fetchInboxItems = async () => {
      // Example: Fetching inbox items from AsyncStorage or an API
      // Replace with your actual data fetching logic
      // const fetchedItems: InboxItem[] = await fetchInboxItemsFromAsyncStorage()
      // setInboxItems(fetchedItems)
    }

    fetchInboxItems()
  }, [])

  // Example function to mark an item as read
  const markAsRead = (id: string) => {
    const updatedItems = inboxItems.map((item) =>
      item.id === id ? { ...item, read: true } : item
    )
    setInboxItems(updatedItems)
    // Example: Persist updated items (e.g., to AsyncStorage or API)
    // persistInboxItems(updatedItems)
  }

  const isNetworkConnected = useRef<boolean | null>(null)
  const appState = useRef(AppState.currentState)
  const [ready, setReady] = useState<boolean>(false)
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
    return () => {}
  }, [connected])

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
          console.log('====> Inbox failed to connect')
          // RNRestart.restart()
          healthCheck()
        }

        const messaging =
          await AccountManager.getInstance().vault?.inbox.getMessaging()
        const inbox = await messaging.getInbox()
        console.log('Set RESTART_INBOX event')

        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          await healthCheck()
          await initInboxMessaging()
          inbox.on('RESTART_INBOX', onFailedToConnect)
        } else if (
          appState.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          await disconnect()
          inbox.removeListener('RESTART_INBOX', onFailedToConnect)
        }

        console.log('onAppStateChanged', nextAppState)
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
      setReady(true)
    })

    return () => {
      unsubscribe && unsubscribe()
    }
  }, [dispatch, healthCheck, onMessage, selectedAccount])

  useEffect(() => {
    async function onAppStateChanged(nextAppState: AppStateStatus) {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // fetchNetInfo().then((state) => {
        //   console.log('Connection type', state.type)
        //   console.log('Is connected?', state.isConnected)
        //   setConnected(state.isConnected ?? false)
        // })
      }

      appState.current = nextAppState
    }

    const appStateSubscriber = AppState.addEventListener(
      'change',
      onAppStateChanged
    )

    const unsubscribe = addEventListener((state) => {
      console.log('2 Connection type', state.type)
      console.log('2 Is connected?', state.isConnected)
      setConnected(state.isConnected ?? false)
    })

    return () => {
      appStateSubscriber?.remove()
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    let tid: any
    console.log('Is Connected', connected)
    if (!connected) {
      tid = setInterval(async () => {
        const state = await fetchNetInfo()
        console.log('Connection type', state.type)
        console.log('Is connected?', state.isConnected)
        setConnected(state.isConnected ?? false)
        if (!state.isConnected) {
          healthCheck()
        } else {
          setConnected(state.isConnected)
        }
      }, 1000)
    } else {
      clearInterval(tid)
    }

    const t2 = setTimeout(() => {
      healthCheck()
    }, 1000)

    return () => {
      clearTimeout(t2)
      clearInterval(tid)
    }
  }, [connected, healthCheck])

  return (
    <InboxContext.Provider value={{ inboxItems, markAsRead }}>
      {children}
    </InboxContext.Provider>
  )
}

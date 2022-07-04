import * as sentry from '@sentry/react-native'
import WalletConnect from '@walletconnect/client'
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useDispatch } from 'react-redux'

import { useReduxState } from 'hooks/useReduxState'
import {
  approveWalletConnectSession,
  rejectWalletConnectSession,
  removeWalletConnectDapp,
  setWalletConnectPeerMeta,
  setWalletConnectRequests,
} from 'reduxStore/actions'
import {
  authenticatedSelector,
  dappsSelector,
  walletConnectRequestSelector,
} from 'reduxStore/selectors'

import { useModal } from '../hooks/useModal'
import ConnectDappModal from '../pages/WalletConnect/ConnectDappModal'
import TransactionRequestModal from '../pages/WalletConnect/TransactionRequestModal'
import { store } from '../reduxStore'
import {
  approveWalletConnectRequest,
  rejectWalletConnectRequest,
} from '../reduxStore/wallet-connect/thunks'
import { getWalletConnectConfig } from '../wallet-connect/config'
import { getWalletController } from '../wallet-connect/controllers'
import { IEtherWalletController } from '../wallet-connect/controllers/type'
import type { DApp, WalletConnectRequest } from '../wallet-connect/types'

const events = [
  'session_request',
  'session_update',
  'call_request',
  'disconnect',
  'connect',
]

export const WalletConnectContext = createContext<
  ReturnType<typeof useWalletConnectContext>
>(null as any)

function useWalletConnectContext() {
  const dispatch = useDispatch()
  const dapps = useReduxState(dappsSelector)
  const authenticated = useReduxState(authenticatedSelector)
  const requests = useReduxState(walletConnectRequestSelector)
  const appState = useRef(AppState.currentState)

  const { showModal, onDismiss: dismissModal } = useModal()

  const initializedRef = useRef(false)
  const connectorsRef = useRef<Record<string, WalletConnect>>({})

  const [activeIndex] = useState(0) // Only support 1 wallet

  const { current: openRequest } = useRef(
    async (connectorKey: string, request: any) => {
      // FIXME: dapps closure stale state issue
      const apps = store.getState().walletConnect.dapps

      const connector = connectorsRef.current[connectorKey]
      const dapp = apps.find((app) => app.session.key === connectorKey)
      const payload = { ...request }
      await getWalletConnectConfig().rpcEngine.router(payload, {
        chainId: dapp?.chainId,
        connector,
        setRequests: (wcRequests: WalletConnectRequest[]) => {
          setWalletConnectRequests({ requests: wcRequests })
        },
        requests,
      })

      const params = payload.params[0]
      if (dapp && request.method === 'eth_sendTransaction') {
        payload.params[0] = await (
          getWalletController(dapp) as IEtherWalletController
        ).populateTransaction(params)
      }

      showModal(
        <TransactionRequestModal
          client={connector.session.peerMeta as any}
          payload={payload}
          dismissModal={() => {
            dispatch(
              rejectWalletConnectRequest({
                connector,
                requestPayload: payload,
              })
            )
            dismissModal()
          }}
          renderPayload={(requestPayload) =>
            getWalletConnectConfig().rpcEngine.render(requestPayload)
          }
          approveRequest={(walletAddress) => {
            dispatch(
              approveWalletConnectRequest({
                connector,
                requestPayload: payload,
                address: dapp?.accounts?.[0] ?? walletAddress,
                activeIndex,
                chainId: dapp?.chainId ?? 0,
              })
            )
            dismissModal()
          }}
          rejectRequest={() => {
            dispatch(
              rejectWalletConnectRequest({
                connector,
                requestPayload: payload,
              })
            )
            dismissModal()
          }}
        />
      )
    }
  )

  const { current: resubscribeToEvents } = useRef(() => {
    if (!authenticated) return
    // console.log('resubscribeToEvents', JSON.stringify(dapps, null, 2))
    dapps.forEach(async (dapp: DApp) => {
      subscribeToEvents(dapp.session.key)
    })
  })

  const showDappConnectModal = useCallback(
    (connectorKey: string, connector: any, peerMeta: any) => {
      peerMeta?.name &&
        showModal(
          <ConnectDappModal
            client={peerMeta}
            connect={(walletAddress, chainId: number, chain: DApp['chain']) => {
              dispatch(
                approveWalletConnectSession({
                  connector,
                  chainId,
                  chain,
                  accounts: [walletAddress],
                })
              )
              resubscribeToEvents()
              dismissModal()
            }}
            dismissModal={() => {
              dispatch(
                rejectWalletConnectSession({
                  connector,
                })
              )
              dismissModal()
            }}
          />
        )
    },
    [dismissModal, dispatch, resubscribeToEvents, showModal]
  )

  const { current: subscribeToEvents } = useRef((connectorKey: string) => {
    const connector = connectorsRef.current[connectorKey]
    if (connector) {
      // unsubscribe from previous events if any
      events.forEach((event) => {
        connector.off(event)
      })

      connector.on('session_request', (error, payload) => {
        if (error) {
          throw error
        }
        const { peerMeta } = payload.params[0]
        dispatch(setWalletConnectPeerMeta({ connector, peerMeta }))
        showDappConnectModal(connectorKey, connector, peerMeta)
      })

      connector.on('session_update', (error) => {
        if (error) {
          throw error
        }
      })

      connector.on('call_request', async (error, payload) => {
        if (error) {
          throw error
        }
        openRequest(connectorKey, payload)
      })

      connector.on('connect', (error) => {
        if (error) {
          throw error
        }
      })

      connector.on('disconnect', (error) => {
        if (error) {
          throw error
        }

        events.forEach((event) => {
          connector.off(event)
        })
        delete connectorsRef.current[connector.key]
        dispatch(removeWalletConnectDapp({ key: connector.key }))
      })
    }
  })

  const requestConnect = useCallback(
    async (uri: string) => {
      const connector = new WalletConnect({
        uri,
      })

      connectorsRef.current[connector.key] = connector

      if (!connector.connected) {
        await connector.createSession()
      }

      subscribeToEvents(connector.key)
    },
    [subscribeToEvents]
  )

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        resubscribeToEvents()
      }

      appState.current = nextAppState
    }
    AppState.addEventListener('change', handleAppStateChange)

    return () => {
      AppState.removeEventListener('change', handleAppStateChange)
    }
  }, [resubscribeToEvents])

  const disconnect = useCallback(async (apps: DApp[]) => {
    apps.forEach(async (dapp: DApp) => {
      const connector = connectorsRef.current[dapp.session.key]
      if (connector) {
        events.forEach((event) => {
          connector.off(event)
        })
      }
    })
  }, [])

  useEffect(() => {
    if (!authenticated || initializedRef.current) return

    const tid = setTimeout(() => {
      const connectDApps = async () => {
        dapps.forEach(async (dapp: DApp) => {
          if (!dapp.session.peerId) {
            dispatch(removeWalletConnectDapp({ key: dapp.session.key }))
            return
          }

          if (connectorsRef.current[dapp.session.key]) {
            subscribeToEvents(dapp.session.key)
            return
          }

          try {
            const wcConnector = new WalletConnect({
              session: dapp.session,
            })
            connectorsRef.current = {
              ...connectorsRef.current,
              [dapp.session.key]: wcConnector,
            }

            subscribeToEvents(wcConnector.key)
          } catch (error) {
            sentry.captureException(error)
          }
        })
      }

      initializedRef.current = true
      connectDApps()
    }, 2000)

    return () => {
      clearTimeout(tid)
      if (initializedRef.current) disconnect(dapps)
    }
  }, [
    activeIndex,
    dapps,
    dispatch,
    subscribeToEvents,
    authenticated,
    disconnect,
  ])

  return {
    dapps,
    requests,
    requestConnect,
  }
}

export function WalletConnectProvider({ children }: any) {
  const walletConnect = useWalletConnectContext()
  return (
    <WalletConnectContext.Provider value={walletConnect}>
      {children}
    </WalletConnectContext.Provider>
  )
}

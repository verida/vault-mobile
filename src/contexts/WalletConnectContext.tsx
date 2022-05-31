import WalletConnect from '@walletconnect/client'
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
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
  walletConnectNetworkSelector,
  walletConnectRequestSelector,
} from 'reduxStore/selectors'

import { useModal } from '../hooks/useModal'
import ConnectDappModal from '../pages/WalletConnect/ConnectDappModal'
import TransactionRequestModal from '../pages/WalletConnect/TransactionRequestModal'
import {
  approveWalletConnectRequest,
  rejectWalletConnectRequest,
} from '../reduxStore/wallet-connect/thunks'
import { getWalletConnectConfig } from '../wallet-connect/config'
import { getWalletController } from '../wallet-connect/controllers'
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

  const { showModal, onDismiss: dismissModal } = useModal()

  const { chain_id: chainId } = useReduxState(walletConnectNetworkSelector)
  const initializedRef = useRef(false)
  const connectorsRef = useRef<Record<string, WalletConnect>>({})

  const [activeIndex] = useState(0) // Only support 1 wallet

  const openRequest = useCallback(
    async (connectorKey: string, request: any) => {
      const connector = connectorsRef.current[connectorKey]
      const payload = { ...request }
      await getWalletConnectConfig().rpcEngine.router(payload, {
        chainId,
        connector,
        setRequests: (wcRequests: WalletConnectRequest[]) => {
          setWalletConnectRequests({ requests: wcRequests })
        },
        requests,
      })

      const params = payload.params[0]
      const dapp = dapps.find((app) => app.session.key === connectorKey)
      if (dapp && request.method === 'eth_sendTransaction') {
        payload.params[0] = await getWalletController(dapp).populateTransaction(
          params
        )
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
                chainId,
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
    },
    [activeIndex, chainId, dapps, dismissModal, dispatch, requests, showModal]
  )

  const subscribeToEvents = useCallback(
    (connectorKey: string) => {
      const connector = connectorsRef.current[connectorKey]
      if (connector) {
        // unsubscribe from previous events
        events.forEach((event) => {
          connector.off(event)
        })

        connector.on('session_request', (error, payload) => {
          if (error) {
            throw error
          }
          const { peerMeta } = payload.params[0]
          dispatch(setWalletConnectPeerMeta({ connector, peerMeta }))

          peerMeta?.name &&
            showModal(
              <ConnectDappModal
                client={peerMeta}
                connect={(
                  walletAddress,
                  _chainId: number,
                  chain: DApp['chain']
                ) => {
                  dispatch(
                    approveWalletConnectSession({
                      connector,
                      chainId: _chainId,
                      chain,
                      accounts: [walletAddress],
                    })
                  )
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

          delete connectorsRef.current[connector.key]
          dispatch(removeWalletConnectDapp({ key: connector.key }))
        })
      }
    },
    [dismissModal, dispatch, openRequest, showModal]
  )

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
    if (!authenticated) return
    const tid = setTimeout(() => {
      // dapps.forEach(async (dapp: DApp) => {
      //   const wcConnector = connectorsRef.current[dapp.session.key]
      //   if (
      //     wcConnector?.session?.chainId === chainId &&
      //     isEqual(wcConnector.session.accounts, [address])
      //   )
      //     return
      //   if (wcConnector) {
      //     wcConnector.updateSession({
      //       accounts: [address],
      //     })
      //     subscribeToEvents(dapp.session.key)
      //     dispatch(
      //       setWalletConnectDapp({
      //         key: dapp.session.key,
      //         session: wcConnector.session,
      //       })
      //     )
      //   }
      // })
      // getWalletController().update(activeIndex, chainId)
    }, 2000)

    return () => {
      clearTimeout(tid)
    }
  }, [activeIndex, authenticated, chainId, dapps, dispatch, subscribeToEvents])

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
          if (connectorsRef.current[dapp.session.key]) {
            return
          }
          const wcConnector = new WalletConnect({
            session: dapp.session,
          })
          connectorsRef.current = {
            ...connectorsRef.current,
            [dapp.session.key]: wcConnector,
          }

          subscribeToEvents(wcConnector.key)
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
    chainId,
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

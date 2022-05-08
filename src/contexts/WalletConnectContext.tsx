/* eslint-disable no-console */
import Clipboard from '@react-native-community/clipboard'
import WalletConnect from '@walletconnect/client'
import { isEmpty } from 'lodash'
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Button, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { useReduxState } from 'hooks/useReduxState'
import {
  approveWalletConnectRequest,
  approveWalletConnectSession,
  rejectWalletConnectRequest,
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

import AccountManager from '../api/AccountManager'
import BottomActionsModal from '../components/BottomActionsModal'
import { useModal } from '../hooks/useModal'
import { getAppConfig } from '../wallet-connect/config'
import { getWalletController } from '../wallet-connect/controllers'
import type {
  DApp,
  IRequestRenderParams,
  WalletConnectRequest,
} from '../wallet-connect/types'

export const WalletConnectContext = createContext<ReturnType<
  typeof useWalletConnectContext
> | null>(null)

const RequestDisplay = (props: any) => {
  const { payload, peerMeta, approveRequest, rejectRequest, renderPayload } =
    props

  const params: IRequestRenderParams[] = renderPayload(payload)

  return (
    <View>
      <Text>Request From</Text>
      <Text>{peerMeta.name}</Text>
      {params.map((param) => (
        <React.Fragment key={param.label}>
          <Text>{param.label}</Text>
          <Text>{param.value}</Text>
        </React.Fragment>
      ))}

      <View>
        <Button title='Approve' onPress={() => approveRequest()} />
        <Button title='Reject' onPress={() => rejectRequest()} />
      </View>
    </View>
  )
}

function useWalletConnectContext() {
  const dispatch = useDispatch()
  const dapps = useReduxState(dappsSelector)
  const authenticated = useReduxState(authenticatedSelector)
  const requests = useReduxState(walletConnectRequestSelector)

  const { isOpen: isModalOpen, showModal, onDismiss: dismissModal } = useModal()

  const clipboardUriRef = useRef(false)
  const connectorsRef = useRef<Record<string, WalletConnect>>({})

  const [chainId, setChainId] = useState<number>(4) // TODO: get from redux
  const [activeIndex, setActiveIndex] = useState(0)
  const [address, setAddress] = useState(
    AccountManager.getInstance()
      .getSelectedAccount()
      ?.did.replace('did:vda:', '') as string
  )

  const openRequest = useCallback(
    async (connectorKey: string, request: any) => {
      const connector = connectorsRef.current[connectorKey]
      const payload = { ...request }

      await getAppConfig().rpcEngine.router(payload, {
        chainId,
        connector,
        setRequests: (wcRequests: WalletConnectRequest[]) => {
          setWalletConnectRequests({ requests: wcRequests })
        },
        requests,
      })

      const params = payload.params[0]
      if (request.method === 'eth_sendTransaction') {
        payload.params[0] = await getWalletController().populateTransaction(
          params
        )
      }

      showModal(
        <BottomActionsModal
          title='Wallet connect request'
          onClose={dismissModal}>
          <RequestDisplay
            payload={payload}
            peerMeta={connector.peerMeta}
            renderPayload={(payload: any) =>
              getAppConfig().rpcEngine.render(payload)
            }
            approveRequest={() => {
              dispatch(
                approveWalletConnectRequest({
                  connector,
                  requestPayload: payload,
                  address,
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
        </BottomActionsModal>
      )
    },
    [activeIndex, address, chainId, dismissModal, dispatch, requests, showModal]
  )

  const subscribeToEvents = useCallback(
    (connectorKey: string) => {
      const connector = connectorsRef.current[connectorKey]
      console.log('subscribeToEvents', connector.key)
      if (connector) {
        connector.on('session_request', (error, payload) => {
          if (error) {
            throw error
          }
          const { peerMeta } = payload.params[0]
          dispatch(setWalletConnectPeerMeta({ connector, peerMeta }))

          peerMeta?.name &&
            showModal(
              <>
                <BottomActionsModal
                  title='Wallet connect'
                  onClose={dismissModal}>
                  <View>
                    <Text>{JSON.stringify(peerMeta)}</Text>
                    <View>
                      <Button
                        title='Approve'
                        onPress={() => {
                          dispatch(
                            approveWalletConnectSession({
                              connector,
                              chainId,
                              accounts: [address],
                            })
                          )
                          dismissModal()
                        }}
                      />
                      <Button
                        title='Reject'
                        onPress={() => {
                          dispatch(
                            rejectWalletConnectSession({
                              connector,
                              chainId,
                              accounts: [address],
                            })
                          )
                          dismissModal()
                        }}
                      />
                    </View>
                  </View>
                </BottomActionsModal>
              </>
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

          // TODO: handle request route here
          // await getAppConfig().rpcEngine.router(payload, {
          //   chainId,
          //   connector,
          //   setRequests: (wcRequests: WalletConnectRequest[]) => {
          //     setWalletConnectRequests({ requests: wcRequests })
          //   },
          //   requests,
          // })

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

        if (connector.connected) {
          const { chainId, accounts } = connector
          const index = 0 // TODO: Deal with multiple accounts
          const address = accounts[index]

          getWalletController().update(index, chainId)

          setAddress(address)
          setChainId(chainId)
        }
      }
    },
    [address, chainId, dismissModal, dispatch, openRequest, showModal]
  )

  useEffect(() => {
    if (!isModalOpen && !isEmpty(requests)) {
      // TODO: extract modal component
      showModal(
        <>
          <BottomActionsModal title='Wallet connect' onClose={dismissModal}>
            <View>
              <Text>Pending Call Requests</Text>
              {requests.length ? (
                requests.map((request) => (
                  <Button
                    title={request.method}
                    key={request.id}
                    onPress={() => openRequest(null, request)}
                  />
                ))
              ) : (
                <Text>{'No pending requests'}</Text>
              )}
            </View>
          </BottomActionsModal>
        </>
      )
    }
  }, [dismissModal, isModalOpen, openRequest, requests, showModal])

  // SHOW DAPP to connect
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

  // TODO: remove test code
  useEffect(() => {
    const tid = setInterval(async () => {
      if (clipboardUriRef.current) return
      const uri = await Clipboard.getString()
      if (uri?.startsWith('wc:') && uri?.indexOf('bridge') >= 0) {
        requestConnect(uri)
        Clipboard.setString('')
        clipboardUriRef.current = true
      } else {
        Clipboard.setString('')
      }
    }, 3000)

    return () => {
      clearTimeout(tid)
    }
  }, [requestConnect])

  const initializedRef = useRef(false)
  useEffect(() => {
    if (!authenticated || initializedRef.current) return

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

      getWalletController().init(activeIndex, chainId)
    }

    const disconnect = async () => {
      const events = [
        'session_request',
        'session_update',
        'call_request',
        'disconnect',
        'connect',
      ]
      dapps.forEach(async (dapp: DApp) => {
        const connector = connectorsRef.current[dapp.session.key]
        if (connector) {
          events.forEach((event) => {
            connector.off(event)
          })
        }
      })
    }

    initializedRef.current = true
    connectDApps()

    return () => {
      disconnect()
    }
  }, [activeIndex, chainId, dapps, dispatch, subscribeToEvents, authenticated])

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

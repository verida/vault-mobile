/* eslint-disable no-shadow */
/* eslint-disable no-console */
import WalletConnect from '@walletconnect/client'
import { ISessionStorage } from '@walletconnect/types'
import { Container } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, Button, ScrollView, View } from 'react-native'
import { connect } from 'react-redux'

import AccountManager from 'api/AccountManager'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import LoadingView from '../../components/LoadingView'
import Text from '../../components/Text'
import LayoutStyle from '../../styles/layouts'
import { getAppConfig } from './config'
import { getAppControllers } from './controllers'
import { getLocal, removeLocal, setLocal } from './helpers/local'
import { IRequestRenderParams } from './helpers/types'
import { getCachedSession } from './helpers/utilities'

export function isWalletConnectSession(object: any) {
  return typeof object.bridge !== 'undefined'
}

class SessionStorage implements ISessionStorage {
  storageId: string
  constructor(storageId = 'walletconnect') {
    this.storageId = storageId
  }
  getSession() {
    let session = null
    const json = getLocal(this.storageId)
    if (json && isWalletConnectSession(json)) {
      session = json
    }
    console.log('getSession', session)
    return session
  }
  setSession(session: any) {
    console.log('setSession', session)
    setLocal(this.storageId, session)
    return session
  }
  removeSession() {
    removeLocal(this.storageId)
    console.log('removeSession')
  }
}

const RequestDisplay = (props: any) => {
  const { payload, peerMeta, approveRequest, rejectRequest, renderPayload } =
    props

  const params: IRequestRenderParams[] = renderPayload(payload)
  console.log('RENDER', 'method', payload.method)
  console.log('RENDER', 'params', payload.params)
  console.log('RENDER', 'formatted', params)

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

const WalletConnectScreen = (props: any) => {
  const { route, selectedAccount } = props

  const { url } = route.params
  const [loading, setLoading] = React.useState(false)
  const [payload, setPayload] = useState<any>(null)

  useEffect(() => {
    const initProfile = async () => {
      try {
        setLoading(true)
        const _selectedAccount =
          AccountManager.getInstance().getSelectedAccount()
        console.log(
          '_selectedAccount',
          _selectedAccount,
          AccountManager.getInstance()
        )

        setLoading(false)
      } catch (e) {
        Alert.alert('Error', 'Cannot get account information')
        setLoading(false)
      }
    }

    if (selectedAccount) {
      initProfile()
    }
  }, [selectedAccount])

  function wConnect() {
    initWalletConnect(url)
  }

  const [connected, setConnected] = useState(false)
  const [connector, setConnector] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [peerMeta, setPeerMeta] = useState<any>(null)
  const [address, setAddress] = useState<string>(
    AccountManager.getInstance()
      .getSelectedAccount()
      ?.did.replace('did:vda:', '') as string
  )
  const [chainId, setChainId] = useState<number>(4)

  const subscribeToEvents = (conn: WalletConnect) => {
    console.log('ACTION', 'subscribeToEvents', connector)

    if (conn) {
      conn.on('session_request', (error, payload) => {
        console.log('EVENT', 'session_request')

        if (error) {
          throw error
        }
        console.log('SESSION_REQUEST', payload.params)
        const { peerMeta } = payload.params[0]
        setPeerMeta(peerMeta)
      })

      conn.on('session_update', (error) => {
        console.log('EVENT', 'session_update')

        if (error) {
          throw error
        }
      })

      conn.on('call_request', async (error, payload) => {
        // tslint:disable-next-line
        console.log('EVENT', 'call_request', 'method', payload.method)
        console.log('EVENT', 'call_request', 'params', payload.params)

        if (error) {
          throw error
        }
        console.log('EVENT', 'call_request ====== ', getAppConfig().rpcEngine, {
          chainId,
          conn,
          setRequests,
          requests,
        })

        await getAppConfig().rpcEngine.router(payload, {
          chainId,
          conn,
          setRequests,
          requests,
        })
      })

      conn.on('connect', (error) => {
        console.log('EVENT', 'connect')

        if (error) {
          throw error
        }

        setConnected(true)
      })

      conn.on('disconnect', (error) => {
        console.log('EVENT', 'disconnect')

        if (error) {
          throw error
        }

        resetApp()
      })

      if (conn.connected) {
        const { chainId, accounts } = conn
        const index = 0
        const address = accounts[index]
        console.log('CONNECTED', chainId, address)
        console.log('connector 2', conn.connected, conn)
        getAppControllers().wallet.update(index, chainId)
        setConnected(true)
        setAddress(address)
        setChainId(chainId)
      }

      setConnector(conn)
    }
  }

  const resetApp = async () => {
    setConnected(false)
    setConnector(null)
    setPayload(null)
    setPeerMeta(null)
    setRequests([])
  }

  const [activeIndex, setActiveIndex] = useState(0)

  const init = async () => {
    const session = getCachedSession()

    if (!session) {
      await getAppControllers().wallet.init(activeIndex, chainId)
    } else {
      const connector = new WalletConnect({
        session,
        storage: new SessionStorage(),
      })

      const { connected, accounts, peerMeta } = connector

      const address = accounts[0]

      const activeIndex = accounts.indexOf(address)
      const chainId = connector.chainId

      await getAppControllers().wallet.init(activeIndex, chainId)

      setConnected(connected)
      setConnector(connector)
      setAddress(address)
      setActiveIndex(activeIndex)
      setChainId(chainId)
      setPeerMeta(peerMeta)

      subscribeToEvents(connector)
    }
    // await getAppConfig().events.init()
  }

  const initWalletConnect = async (uri: string) => {
    const _connector = new WalletConnect({
      uri,
      storage: new SessionStorage(),
    })
    console.log('_connector', _connector)
    setConnector(_connector)

    if (!_connector.connected) {
      await _connector.createSession()
      console.log('_connector', _connector)
    }

    setLoading(false)
    setConnector(_connector)

    subscribeToEvents(_connector)
  }

  const openRequest = async (request: any) => {
    const payload = { ...request }
    console.log('openRequest', request)

    const params = payload.params[0]
    if (request.method === 'eth_sendTransaction') {
      payload.params[0] = await getAppControllers().wallet.populateTransaction(
        params
      )
    }

    console.log('ACTION', 'openRequest', request, payload)
    setPayload(payload)
  }

  const closeRequest = async () => {
    const filteredRequests = requests.filter(
      (request) => request.id !== payload.id
    )
    setRequests(filteredRequests)
    setPayload(null)
  }

  const approveRequest = async () => {
    try {
      await getAppConfig().rpcEngine.signer(payload, {
        connector,
        address,
        activeIndex,
        chainId,
      })
    } catch (error) {
      console.error(error)
      if (connector) {
        connector.rejectRequest({
          id: payload.id,
          error: { message: 'Failed or Rejected Request' },
        })
      }
    }

    closeRequest()
    setConnector(connector)
  }

  const rejectRequest = async () => {
    if (connector) {
      connector.rejectRequest({
        id: payload.id,
        error: { message: 'Failed or Rejected Request' },
      })
    }
    await closeRequest()
    setConnector(connector)
  }

  const approveSession = () => {
    console.log('ACTION', 'approveSession')
    console.log('ACTION', 'approveSession', connector, chainId, address)
    if (connector) {
      connector.approveSession({ chainId, accounts: [address] })
    }
  }

  const rejectSession = () => {
    console.log('ACTION', 'rejectSession')
    if (connector) {
      connector.rejectSession()
    }
  }

  const killSession = () => {
    console.log('ACTION', 'killSession')
    if (connector) {
      connector.killSession()
    }
    resetApp()
  }

  useEffect(() => {
    init()

    return () => {
      killSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container>
      <NavigationHeader left={{ icon: 'back' }} title='Wallet Connect' />
      {loading ? (
        <LoadingView />
      ) : (
        <View style={[LayoutStyle.layout, { flexDirection: 'column' }]}>
          {!connected ? (
            peerMeta && peerMeta.name ? (
              <View>
                <Text>{JSON.stringify(peerMeta)}</Text>
                <View>
                  <Button title='Approve' onPress={approveSession} />
                  <Button title='Reject' onPress={rejectSession} />
                </View>
              </View>
            ) : (
              <Button title='Connect' onPress={() => wConnect()} />
            )
          ) : !payload ? (
            <View>
              <Text>Pending Call Requests</Text>
              {requests.length ? (
                requests.map((request) => (
                  <Button
                    title={request.method}
                    key={request.id}
                    onPress={() => openRequest(request)}
                  />
                ))
              ) : (
                <Text>{'No pending requests'}</Text>
              )}
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ maxHeight: 500, paddingBottom: 300 }}>
              <RequestDisplay
                payload={payload}
                peerMeta={peerMeta}
                renderPayload={(payload: any) =>
                  getAppConfig().rpcEngine.render(payload)
                }
                approveRequest={approveRequest}
                rejectRequest={rejectRequest}
              />
            </ScrollView>
          )}
        </View>
      )}
    </Container>
  )
}

const mapStateToProps = (state: any) => {
  return {
    publicProfileData: state.publicProfileData,
    selectedAccount: state.selectedAccount,
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletConnectScreen)

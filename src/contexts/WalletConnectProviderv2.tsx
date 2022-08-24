import * as Sentry from '@sentry/react-native'
import { SignClientTypes } from '@walletconnect/types'
import isEmpty from 'lodash/isEmpty'
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Alert, AppState } from 'react-native'
import { useDispatch } from 'react-redux'
import { NEAR_SIGNING_METHODS } from 'wallet-connect/constants/near'
import { approveNearRequest } from 'wallet-connect/helpers/NearRequestHandler'
import { createOrRestoreNearWallet } from 'wallet-connect/helpers/NearWalletUtil'
import { getWC2SignClient } from 'wallet-connect/helpers/wallet2'

import usePrevious from 'hooks/usePrevious'
import { useReduxState } from 'hooks/useReduxState'
import Connectv2DappModal from 'pages/WalletConnect/ConnectDappModalv2'
import TransactionRequestModalv2 from 'pages/WalletConnect/TransactionRequestModalv2'
import {
  authenticatedSelector,
  dappsSelector,
  walletConnectRequestSelector,
} from 'reduxStore/selectors'
import { selectedWalletSelector } from 'reduxStore/wallet/selectors'

import { useModal } from '../hooks/useModal'

export const WalletConnectContextv2 = createContext<
  ReturnType<typeof useWalletConnectContextv2>
>(null as any)

function useWalletConnectContextv2() {
  const [initialized, setInitialized] = useState(false)
  const dispatch = useDispatch()
  const dapps = useReduxState(dappsSelector)
  const authenticated = useReduxState(authenticatedSelector)
  const requests = useReduxState(walletConnectRequestSelector)
  const appState = useRef(AppState.currentState)
  const selectedWalletId = useReduxState(selectedWalletSelector)
  const previousDapps = usePrevious(dapps)

  const { showModal, dismissModal } = useModal()

  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      console.log('onSessionProposal', JSON.stringify(proposal, null, 2))
      showModal(
        <Connectv2DappModal proposal={proposal} dismissModal={dismissModal} />
      )
    },
    [dismissModal, showModal]
  )

  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      console.log('session_request', requestEvent)
      const signClient = await getWC2SignClient()
      const { id, topic, params } = requestEvent
      const { chainId, request } = params
      const requestSession = signClient.session.get(topic)

      switch (request.method) {
        case NEAR_SIGNING_METHODS.NEAR_SIGN_IN:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_OUT:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTION:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_AND_SEND_TRANSACTION:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTIONS:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_AND_SEND_TRANSACTIONS:
          showModal(
            <TransactionRequestModalv2
              requestEvent={requestEvent}
              requestSession={requestSession}
              dismissModal={dismissModal}
            />
          )
          break
        case NEAR_SIGNING_METHODS.NEAR_GET_ACCOUNTS:
          return signClient.respond({
            topic,
            response: await approveNearRequest(requestEvent),
          })
        default:
          Alert.alert('Error', 'Unsupported method')
      }
    },
    [dismissModal, showModal]
  )

  const requestConnect = useCallback(async (uri: string) => {
    try {
      console.log('onConnect', uri)
      const signClient = await getWC2SignClient()
      signClient.pair({ uri })
    } catch (err: Error) {
      Sentry.captureException(err)
      console.log('Error connect', err)
      Alert.alert('Error', 'Unable to pair with the dapp')
    }
  }, [])

  useEffect(() => {
    if (!authenticated || initialized) return
    ;(async () => {
      if (!initialized) {
        await createOrRestoreNearWallet()
        // TODO: support more chains
        setInitialized(true)
      }
    })()
  }, [authenticated, initialized])

  useEffect(() => {
    if (!authenticated || !initialized) return
    const initialize = async () => {
      const signClient = await getWC2SignClient()
      signClient.on('session_proposal', onSessionProposal)
      signClient.on('session_request', onSessionRequest)
      // TODOs
      signClient.on('session_ping', (data) => console.log('ping', data))
      signClient.on('session_event', (data) => console.log('event', data))
      signClient.on('session_update', (data) => console.log('update', data))
      signClient.on('session_delete', (data) => console.log('delete', data))
    }

    initialize()
  }, [authenticated, initialized, onSessionProposal, onSessionRequest])

  // const [uri, setUri] = useState(
  //   'wc:c034ac9bf61c23d3e551663ed8bf973c260130c12f89f22a35a5d1032e3c47af@2?relay-protocol=iridium&symKey=05f034367d195bca2532385b620bd2b2a6c5c62101050bdfe9253e283fe50e12'
  // )
  // useEffect(() => {
  //   async function onConnectV2() {
  //     try {
  //       console.log('onConnect', uri)
  //       const signClient = await getWC2SignClient()
  //       signClient.pair({ uri })
  //       console.log('Pairing complete')
  //     } catch (err: Error) {
  //       console.log('Error connect', err)
  //       console.log(err.stacktrace)
  //     } finally {
  //       setUri('')
  //     }
  //   }
  //   if (!isEmpty(uri)) {
  //     onConnectV2()
  //     console.log('WC: connecting to uri', uri)
  //   }
  // }, [uri])

  return {
    dapps,
    requestConnect,
  }
}

export function WalletConnectProviderv2({ children }: any) {
  const walletConnectv2 = useWalletConnectContextv2()
  return (
    <WalletConnectContextv2.Provider value={walletConnectv2}>
      {children}
    </WalletConnectContextv2.Provider>
  )
}

import * as Sentry from '@sentry/react-native'
import { SignClientTypes } from '@walletconnect/typesv2'
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
import {
  approveNearRequest,
  wrongNearAccountRequest,
} from 'wallet-connect/helpers/NearRequestHandler'
import {
  createOrRestoreNearWallet,
  nearWallet,
} from 'wallet-connect/helpers/NearWalletUtil'
import { getWC2SignClient } from 'wallet-connect/helpers/SignClient'

import usePrevious from 'hooks/usePrevious'
import { useReduxState } from 'hooks/useReduxState'
import ConnectDappModalv2 from 'pages/WalletConnect/ConnectDappModalv2'
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
        <ConnectDappModalv2 proposal={proposal} dismissModal={dismissModal} />
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
      const matchedNearAccounts = await nearWallet.getAccounts({ topic })

      switch (request.method) {
        case NEAR_SIGNING_METHODS.NEAR_SIGN_IN:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_OUT:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTION:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_AND_SEND_TRANSACTION:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTIONS:
        case NEAR_SIGNING_METHODS.NEAR_SIGN_AND_SEND_TRANSACTIONS:
          if (!isEmpty(matchedNearAccounts)) {
            showModal(
              <TransactionRequestModalv2
                requestEvent={requestEvent}
                requestSession={requestSession}
                dismissModal={dismissModal}
              />
            )
          } else {
            await signClient.respond({
              topic,
              response: wrongNearAccountRequest(requestEvent),
            })
          }
          break
        case NEAR_SIGNING_METHODS.NEAR_GET_ACCOUNTS:
          if (!isEmpty(matchedNearAccounts)) {
            return signClient.respond({
              topic,
              response: await approveNearRequest(requestEvent),
            })
          } else {
            await signClient.respond({
              topic,
              response: wrongNearAccountRequest(requestEvent),
            })
          }
          break
        default:
          Alert.alert('Error', 'Unsupported method')
      }
    },
    [dismissModal, showModal]
  )

  const requestConnect = useCallback(async (uri: string) => {
    try {
      const signClient = await getWC2SignClient()
      await signClient.pair({ uri })
    } catch (err: any) {
      Sentry.captureException(err)
      Alert.alert('Error', 'Unable to pair: ', err.message)
    }
  }, [])

  const currentWalletIdRef = useRef(null)
  useEffect(() => {
    if (!authenticated || !selectedWalletId) return
    if (currentWalletIdRef.current !== selectedWalletId) {
      ;(async () => {
        await createOrRestoreNearWallet()
        currentWalletIdRef.current = selectedWalletId
        setInitialized(true)
      })()
    }
  }, [authenticated, initialized, selectedWalletId])

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

  const [uri, setUri] = useState('')
  useEffect(() => {
    async function onConnectV2() {
      try {
        console.log('onConnect', uri)
        const signClient = await getWC2SignClient()
        signClient.pair({ uri })
      } catch (err: Error) {
        console.log('Error connect', err)
        console.log(err.stacktrace)
      } finally {
        setUri('')
      }
    }
    if (!isEmpty(uri)) {
      onConnectV2()
      console.log('WC: connecting to uri', uri)
    }
  }, [uri])

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

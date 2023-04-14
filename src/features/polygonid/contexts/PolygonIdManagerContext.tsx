import {
  AuthorizationRequestMessage,
  CredentialsOfferMessage,
  PROTOCOL_CONSTANTS,
} from '@0xpolygonid/js-sdk'
import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { EnvironmentType } from '@verida/types'
import React, { createContext, useCallback, useMemo } from 'react'

import {
  PolygonIdManagerConfig,
  useCreatePolygonIdManager,
  usePolygonContext,
} from '../polygon'
import { parseQrCodeMessage } from '../utils'

type PolygonIdContextType = {
  handleQRCodeMessage: (data: string) => void
  handleAcceptConnectionRequest: (data: AuthorizationRequestMessage) => void
  handleAcceptProofRequest: (data: AuthorizationRequestMessage) => void
  handleAcceptCredentialOffer: (data: CredentialsOfferMessage) => void
}

export const PolygonIdManagerContext =
  createContext<PolygonIdContextType | null>(null)

const config: PolygonIdManagerConfig = {
  polygonIdSeed: 'daveseedseedseedseedseedseeduser',
  veridaPrivateKey:
    'sphere divide black dove never shoot world issue brand achieve income raw',
  environment: EnvironmentType.TESTNET,
  contextName: 'Verida: Vault',
  didClientConfig: {
    callType: 'gasless',
    web3Config: {
      rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
      serverConfig: {
        headers: {
          'context-name': 'Verida: Vault',
        },
      },
      postConfig: {
        headers: {
          'user-agent': 'Verida-Vault',
        },
      },
      endpointUrl: 'https://meta-tx-server1.tn.verida.tech',
    },
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    didEndpoints: [],
  },
}

export const PolygonIdManagerProvider: React.FunctionComponent = (props) => {
  const { children } = props

  const navigation = useNavigation()

  const { handleAuthRequest, hanldeFetchRequest } = usePolygonContext()
  const state = useCreatePolygonIdManager(config)
  const maybeManagerId = 'result' in state ? state.result : undefined

  const handleQRCodeMessage = useCallback(
    async (qrCodeMessage: string) => {
      const data = parseQrCodeMessage(qrCodeMessage) // TODO: Handle error

      switch (data.type) {
        case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE
          .AUTHORIZATION_REQUEST_MESSAGE_TYPE:
          const requestData = data as AuthorizationRequestMessage
          // Either a Connection request or a ZK Proof request
          // if (data.body.scope && data.body.scope.length) {
          if (requestData.body?.scope && requestData.body.scope.length) {
            // We have a scope object implying we need to submit a ZK proof
            navigation.navigate('ProofRequest', {
              connectionName: requestData.from,
              requestMessage: `Do you want to submit a ZKP with the following data?`,
              data: requestData,
            })
          } else {
            // We have a generic connection request
            navigation.navigate('ConnectionRequest', {
              connectionName: requestData.from,
              requestMessage: requestData.body?.reason,
              data: requestData,
            })
          }
          break
        case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE
          .CREDENTIAL_OFFER_MESSAGE_TYPE:
          const offerData = data as CredentialsOfferMessage
          // Offer to save a new ZK credential
          navigation.navigate('IncomingDataRequest', {
            connectionName: offerData.from,
            requestMessage: `Do you want to accept a ZK credential with the following credential data?`,
            data: offerData,
          })
          break
      }
    },
    [navigation]
  )

  const handleAcceptConnectionRequest = useCallback(
    async (data: AuthorizationRequestMessage) => {
      try {
        console.debug('Accepting Connection Request...')
        console.debug("managerId: ", maybeManagerId)
        await handleAuthRequest({ data, managerId: maybeManagerId! })
        // TODO: define what to do afterwards (confirmation screen?)
      } catch (error: unknown) {
        Sentry.captureException(error)
        // TODO: Handle error in UI. Use error.message?
      }
    },
    []
  )

  const handleAcceptProofRequest = useCallback(
    async (data: AuthorizationRequestMessage) => {
      try {
        console.debug('Accepting Proof Request')
        await handleAuthRequest({ data, managerId: maybeManagerId! })
        // TODO: define what to do afterwards (confirmation screen?)
      } catch (error: unknown) {
        Sentry.captureException(error)
        // TODO: Handle error in UI. Use error.message?
      }
    },
    []
  )

  const handleAcceptCredentialOffer = useCallback(
    async (data: CredentialsOfferMessage) => {
      try {
        console.debug('Accepting Credential Offer...')
        await hanldeFetchRequest({ data, managerId: maybeManagerId! })
        // TODO: define what to do afterwards (confirmation screen?)
      } catch (error: unknown) {
        Sentry.captureException(error)
        // TODO: Handle error in UI. Use error.message?
      }
    },
    []
  )

  const contextValue: PolygonIdContextType = useMemo(
    () => ({
      handleQRCodeMessage,
      handleAcceptConnectionRequest,
      handleAcceptProofRequest,
      handleAcceptCredentialOffer,
    }),
    [
      handleQRCodeMessage,
      handleAcceptConnectionRequest,
      handleAcceptProofRequest,
      handleAcceptCredentialOffer,
    ]
  )

  return (
    <PolygonIdManagerContext.Provider value={contextValue}>
      {children}
    </PolygonIdManagerContext.Provider>
  )
}

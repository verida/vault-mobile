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
  handleAcceptConnectionRequest: (
    data: AuthorizationRequestMessage
  ) => Promise<boolean>
  handleAcceptProofRequest: (
    data: AuthorizationRequestMessage
  ) => Promise<boolean>
  handleAcceptCredentialOffer: (
    data: CredentialsOfferMessage
  ) => Promise<boolean>
}
// TODO: For all handle functions, return something else than a boolean

export const PolygonIdManagerContext =
  createContext<PolygonIdContextType | null>(null)

// TODO: Define the config based on the current selected Account
// TODO: Find a better way to pass the sensitive information to the manager.
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

  const { handleAuthorizationRequest, handleCredentialOffer } =
    usePolygonContext()
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
              connectionLabel: 'Issuer Demo', // TODO: Find a way to get it
              connectionHostname: 'issuer-demo.com', // TODO: Get from the callback?
              requestDetails: {
                timestamp: new Date(),
                requesterId: requestData.from,
                message: requestData.body?.reason,
              },
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
        console.debug('managerId: ', maybeManagerId)
        await handleAuthorizationRequest({ data, managerId: maybeManagerId! })
        // TODO: define what to do afterwards (confirmation screen?)
        return true
      } catch (error: unknown) {
        Sentry.captureException(error)
        // TODO: Handle error in UI. Use error.message?
        return false
      }
    },
    [maybeManagerId, handleAuthorizationRequest]
  )

  const handleAcceptProofRequest = useCallback(
    async (data: AuthorizationRequestMessage) => {
      try {
        console.debug('Accepting Proof Request')
        await handleAuthorizationRequest({ data, managerId: maybeManagerId! })
        // TODO: define what to do afterwards (confirmation screen?)
        return true
      } catch (error: unknown) {
        Sentry.captureException(error)
        // TODO: Handle error in UI. Use error.message?
        return false
      }
    },
    [maybeManagerId, handleAuthorizationRequest]
  )

  const handleAcceptCredentialOffer = useCallback(
    async (data: CredentialsOfferMessage) => {
      try {
        console.debug('Accepting Credential Offer...')
        await handleCredentialOffer({ data, managerId: maybeManagerId! })
        // TODO: define what to do afterwards (confirmation screen?)
        return true
      } catch (error: unknown) {
        Sentry.captureException(error)
        // TODO: Handle error in UI. Use error.message?
        return false
      }
    },
    [maybeManagerId, handleCredentialOffer]
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

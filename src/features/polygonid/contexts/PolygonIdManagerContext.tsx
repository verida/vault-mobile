import type {
  AuthorizationRequestMessage,
  AuthorizationResponseMessage,
  CredentialsOfferMessage,
  W3CCredential,
} from '@0xpolygonid/js-sdk'
import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { EnvironmentType } from '@verida/types'
import { PROTOCOL_MESSAGE_TYPE } from 'features/polygonid/constants'
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
  ) => Promise<{
    result?: {
      callbackResponse: any
      authResponse: AuthorizationResponseMessage
    }
    error?: Error
  }>
  handleAcceptProofRequest: (data: AuthorizationRequestMessage) => Promise<{
    result?: {
      callbackResponse: any
      authResponse: AuthorizationResponseMessage
    }
    error?: Error
  }>
  handleAcceptCredentialOffer: (data: CredentialsOfferMessage) => Promise<{
    result?: W3CCredential[]
    error?: Error
  }>
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
        case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE:
          const requestData = data as AuthorizationRequestMessage
          // Either a Connection request or a ZK Proof request
          if (requestData.body?.scope && requestData.body.scope.length) {
            // We have a scope object implying we need to submit a ZK proof
            navigation.navigate('ProofRequest', {
              name: 'Unknown',
              // name: 'Verifier',
              // logo: 'https://pbs.twimg.com/profile_images/1512411519031857155/qfPRQjEW_400x400.jpg',
              details: {
                protocols: ['polygonid'],
                timestamp: new Date(),
                requesterId: requestData.from || 'Unknown',
                message: requestData.body?.reason,
                // message:  'Please provide a proof of age to unlock additional features.',
                // url: 'issuer-demo.polygonid.me',
              },
              data: requestData,
            })
          } else {
            // We have a generic connection request
            navigation.navigate('ConnectionRequest', {
              name: 'Unknown',
              // name: 'Issuer',
              // logo: 'https://pbs.twimg.com/profile_images/1512411519031857155/qfPRQjEW_400x400.jpg',
              details: {
                protocols: ['polygonid'],
                timestamp: new Date(),
                requesterId: requestData.from || 'Unknown',
                message: requestData.body?.reason,
                // message: 'Please accept this connection to access the Issuer.',
                // url: 'issuer-demo.polygonid.me',
              },
              data: requestData,
            })
          }
          break
        case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE:
          const offerData = data as CredentialsOfferMessage
          // Offer to save a new ZK credential
          navigation.navigate('IncomingDataRequest', {
            name: 'Unknown',
            // name: 'Issuer',
            // logo: 'https://pbs.twimg.com/profile_images/1512411519031857155/qfPRQjEW_400x400.jpg',
            details: {
              protocols: ['polygonid'],
              timestamp: new Date(),
              requesterId: offerData.from || 'Unknown',
              // message: `Your age credential with your birthday is attached to this message.`,
              // url: 'issuer-demo.polygonid.me',
            },
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
        const result = await handleAuthorizationRequest({
          data,
          managerId: maybeManagerId!,
        })
        return { result }
      } catch (error: unknown) {
        Sentry.captureException(error)
        return {
          error: new Error(
            'Something went wrong when accepting the Polygon ID connection request.',
            { cause: error }
          ),
        }
      }
    },
    [maybeManagerId, handleAuthorizationRequest]
  )

  const handleAcceptProofRequest = useCallback(
    async (data: AuthorizationRequestMessage) => {
      try {
        const result = await handleAuthorizationRequest({
          data,
          managerId: maybeManagerId!,
        })
        return { result }
      } catch (error: unknown) {
        Sentry.captureException(error)
        return {
          error: new Error(
            'Something went wrong when answering the Polygon ID proof request.',
            { cause: error }
          ),
        }
      }
    },
    [maybeManagerId, handleAuthorizationRequest]
  )

  const handleAcceptCredentialOffer = useCallback(
    async (data: CredentialsOfferMessage) => {
      try {
        const result = await handleCredentialOffer({
          data,
          managerId: maybeManagerId!,
        })
        return { result }
      } catch (error: unknown) {
        Sentry.captureException(error)
        return {
          error: new Error(
            'Something went wrong when accepting the Polygon ID credential offer.',
            { cause: error }
          ),
        }
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

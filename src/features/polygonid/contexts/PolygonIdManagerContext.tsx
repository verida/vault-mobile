import type {
  AuthorizationRequestMessage,
  AuthorizationResponseMessage,
  CredentialsOfferMessage,
  W3CCredential,
} from '@0xpolygonid/js-sdk'
import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { PROTOCOL_MESSAGE_TYPE } from 'features/polygonid/constants'
import React, { createContext, useCallback, useMemo } from 'react'

import AccountManager from 'api/AccountManager'

import CONFIG from '../../../config/environment'
import {
  PolygonIdManagerConfig,
  useCreatePolygonIdManager,
  usePolygonContext,
} from '../polygon'
import { parseQrCodeMessage } from '../utils'

type PolygonIdContextType = {
  handleQRCodeMessage: (data: string) => boolean
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

export const PolygonIdManagerContext =
  createContext<PolygonIdContextType | null>(null)

const accountManager = AccountManager.getInstance()
const account = accountManager.getSelectedAccount()

// TODO: Define the config based on the current selected Account
// TODO: Find a better way to pass the sensitive information to the manager.
const config: PolygonIdManagerConfig = {
  // PolygonID Private Key is a 32 char hex
  // Make it the same as the Verida identity so there is a 1:1 relationship
  polygonIdPrivateKey: account!.privateKey,
  veridaPrivateKey: account!.privateKey,
  environment: CONFIG.VERIDA_ENVIRONMENT,
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
    (qrCodeMessage: string) => {
      try {
        const data = parseQrCodeMessage(qrCodeMessage)

        switch (data.type) {
          case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE: {
            const requestData = data as AuthorizationRequestMessage
            if (requestData.body?.scope && requestData.body.scope.length) {
              // We have a scope object implying we need to submit a ZK proof
              navigation.navigate('ProofRequest', {
                // TODO: Find a way to get the name of the requester
                name: 'Unknown',
                // TODO: Find a way to get the logo of the requester
                details: {
                  protocols: ['polygonid'],
                  timestamp: new Date().toISOString(),
                  requesterId: requestData.from || 'Unknown',
                  // TODO: Check if requestData.body?.message is better than reason
                  message: requestData.body?.reason,
                },
                data: requestData,
              })
            } else {
              // We have a generic connection request
              navigation.navigate('ConnectionRequest', {
                // TODO: Find a way to get the name of the requester
                name: 'Unknown',
                // TODO: Find a way to get the logo of the requester
                details: {
                  protocols: ['polygonid'],
                  timestamp: new Date().toISOString(),
                  requesterId: requestData.from || 'Unknown',
                  // TODO: Check if requestData.body?.message is better than reason
                  message: requestData.body?.reason,
                },
                data: requestData,
              })
            }
            return true
          }
          case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE: {
            const offerData = data as CredentialsOfferMessage
            navigation.navigate('IncomingDataRequest', {
              // TODO: Find a way to get the name of the requester
              name: 'Unknown',
              // TODO: Find a way to get the logo of the requester
              details: {
                protocols: ['polygonid'],
                timestamp: new Date().toISOString(),
                requesterId: offerData.from || 'Unknown',
              },
              data: offerData,
            })
            return true
          }
          default: {
            return false
          }
        }
      } catch (error: unknown) {
        // Error somewhere in the QR code parsing or Polygon ID type not supported. Return false so the QR Code scanner can use it if needed.
        return false
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

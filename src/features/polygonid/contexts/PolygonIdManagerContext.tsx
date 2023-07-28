import type {
  AuthorizationRequestMessage,
  AuthorizationResponseMessage,
  CredentialsOfferMessage,
  W3CCredential,
} from '@0xpolygonid/js-sdk'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import { PROTOCOL_MESSAGE_TYPE } from 'features/polygonid/constants'
import React, { createContext, useCallback, useMemo } from 'react'

import { MainStackParams } from 'navigation/types'
import type {
  ConnectionRequestScreenParams,
  IncomingDataRequestScreenParams,
  ProofRequestScreenParams,
} from 'pages/Requests'

import { useCreatePolygonIdManager, usePolygonContext } from '../polygon'
import { parseDeepLinkUrl, parseQrCodeMessage } from '../utils'

type PolygonIdContextType = {
  isReady: boolean
  handleDeepLinkUrl: (url: string) => void
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
  handleAcceptCredentialsOffer: (data: CredentialsOfferMessage) => Promise<{
    result?: W3CCredential[]
    error?: Error
  }>
}

// export const PolygonIdManagerContext =
//   createContext<PolygonIdContextType | null>(null)
// TODO: Revert back to null initial value after changing Polygon ID implementation. The current WebView implementation means that the context is not available until the WebView is ready.
export const PolygonIdManagerContext = createContext<PolygonIdContextType>({
  isReady: false,
  handleDeepLinkUrl: () => {
    // Nothing
  },
  handleQRCodeMessage: () => {
    // Nothing
  },
  handleAcceptConnectionRequest: async () => ({}),
  handleAcceptProofRequest: async () => ({}),
  handleAcceptCredentialsOffer: async () => ({}),
})

export const PolygonIdManagerProvider: React.FunctionComponent = (props) => {
  const { children } = props

  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()

  const { isReady, handleAuthorizationRequest, handleCredentialsOffer } =
    usePolygonContext()
  const state = useCreatePolygonIdManager()
  const maybeManagerId = 'result' in state ? state.result : undefined

  const isPolygonIdReady = isReady && !!maybeManagerId

  const handleMessage = useCallback(
    (
      message: AuthorizationRequestMessage | CredentialsOfferMessage,
      replaceNavigationScreen?: boolean
    ) => {
      // TODO: factorise this function that's becoming too big
      switch (message.type) {
        case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE: {
          const requestData = message as AuthorizationRequestMessage
          if (requestData.body?.scope && requestData.body.scope.length) {
            // We have a scope object implying we need to submit a ZK proof
            const screenParams: ProofRequestScreenParams = {
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
            }
            if (replaceNavigationScreen) {
              navigation.replace('ProofRequest', screenParams)
            } else {
              navigation.navigate('ProofRequest', screenParams)
            }
          } else {
            // We have a generic connection request
            const screenParams: ConnectionRequestScreenParams = {
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
            }
            if (replaceNavigationScreen) {
              navigation.replace('ConnectionRequest', screenParams)
            } else {
              navigation.navigate('ConnectionRequest', screenParams)
            }
          }
          return
        }
        case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE: {
          const offerData = message as CredentialsOfferMessage
          const screenParams: IncomingDataRequestScreenParams = {
            // TODO: Find a way to get the name of the requester
            name: 'Unknown',
            // TODO: Find a way to get the logo of the requester
            details: {
              protocols: ['polygonid'],
              timestamp: new Date().toISOString(),
              requesterId: offerData.from || 'Unknown',
            },
            data: offerData,
          }
          if (replaceNavigationScreen) {
            navigation.replace('IncomingDataRequest', screenParams)
          } else {
            navigation.navigate('IncomingDataRequest', screenParams)
          }
          return
        }
        default: {
          throw new Error(
            `Polygon ID message type not supported: ${message.type}}`
          )
        }
      }
    },
    [navigation]
  )

  const handleDeepLinkUrl = useCallback(
    (url: string) => {
      // No try/cath needed, as handled by the consumer
      const message = parseDeepLinkUrl(url)
      handleMessage(message, false)
      // Assuming the deep link doesn't come a particular screen so we don't replace it.
    },
    [handleMessage]
  )

  const handleQRCodeMessage = useCallback(
    (qrCodeMessage: string) => {
      // No try/cath needed, as handled by the consumer
      const message = parseQrCodeMessage(qrCodeMessage)
      handleMessage(message, true)
      // Assuming the QR Code comes from the scanner screen, we replace this screen, so when the user is finished with the Polygon ID screen, they go back to the previous screen, not the QR Code scanner screen
    },
    [handleMessage]
  )

  const handleAcceptConnectionRequest = useCallback(
    async (data: AuthorizationRequestMessage) => {
      if (!isPolygonIdReady) {
        return {
          error: new Error('Polygon ID engine is not ready.'),
        }
      }
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
            // TODO: Adapt the error message to the type of error
            // The error message must be user-friendly, as it will be displayed in the UI
            'Something went wrong when accepting the Polygon ID connection request.',
            { cause: error }
          ),
        }
      }
    },
    [isPolygonIdReady, maybeManagerId, handleAuthorizationRequest]
  )

  const handleAcceptProofRequest = useCallback(
    async (data: AuthorizationRequestMessage) => {
      if (!isPolygonIdReady) {
        return {
          error: new Error('Polygon ID engine is not ready.'),
        }
      }
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
            // TODO: Adapt the error message to the type of error
            // The error message must be user-friendly, as it will be displayed in the UI
            'Something went wrong when answering the Polygon ID proof request.',
            { cause: error }
          ),
        }
      }
    },
    [isPolygonIdReady, maybeManagerId, handleAuthorizationRequest]
  )

  const handleAcceptCredentialsOffer = useCallback(
    async (data: CredentialsOfferMessage) => {
      if (!isPolygonIdReady) {
        return {
          error: new Error('Polygon ID engine is not ready.'),
        }
      }
      try {
        const result = await handleCredentialsOffer({
          data,
          managerId: maybeManagerId!,
        })
        return { result }
      } catch (error: unknown) {
        Sentry.captureException(error)
        return {
          error: new Error(
            // TODO: Adapt the error message to the type of error
            // The error message must be user-friendly, as it will be displayed in the UI
            'Something went wrong when accepting the Polygon ID credential offer.',
            { cause: error }
          ),
        }
      }
    },
    [isPolygonIdReady, maybeManagerId, handleCredentialsOffer]
  )

  const contextValue: PolygonIdContextType = useMemo(
    () => ({
      isReady: isPolygonIdReady,
      handleDeepLinkUrl,
      handleQRCodeMessage,
      handleAcceptConnectionRequest,
      handleAcceptProofRequest,
      handleAcceptCredentialsOffer,
    }),
    [
      isPolygonIdReady,
      handleDeepLinkUrl,
      handleQRCodeMessage,
      handleAcceptConnectionRequest,
      handleAcceptProofRequest,
      handleAcceptCredentialsOffer,
    ]
  )

  return (
    <PolygonIdManagerContext.Provider value={contextValue}>
      {children}
    </PolygonIdManagerContext.Provider>
  )
}

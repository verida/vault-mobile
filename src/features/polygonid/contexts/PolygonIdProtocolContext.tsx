import {
  AuthorizationRequestMessage,
  CredentialsOfferMessage,
  PROTOCOL_CONSTANTS,
} from '@0xpolygonid/js-sdk'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Logger } from 'features/telemetry'
import React, { createContext, useCallback, useMemo } from 'react'

import { MainStackParams } from 'navigation/types'
import type {
  ConnectionRequestScreenParams,
  IncomingDataRequestScreenParams,
  ProofRequestScreenParams,
} from 'pages/Requests'

import { getEntityMetadata, parsePolygonIdMessage } from '../utils'

const logger = Logger.create('PolygonId')

export type PolygonIdProtocolContextType = {
  handleDeepLinkUrl: (url: string) => void
  handleQRCodeMessage: (data: string) => void
}

export const PolygonIdProtocolContext =
  createContext<PolygonIdProtocolContextType | null>(null)

export const PolygonIdProtocolProvider: React.FunctionComponent = (props) => {
  const { children } = props

  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()

  const handleMessage = useCallback(
    async (
      message: AuthorizationRequestMessage | CredentialsOfferMessage,
      replaceNavigationScreen?: boolean
    ) => {
      const entityMetadata = await getEntityMetadata(
        message.from,
        message.type ===
          PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE
            .AUTHORIZATION_REQUEST_MESSAGE_TYPE
          ? (message as AuthorizationRequestMessage).body.callbackUrl
          : undefined
      )

      // TODO: factorise this function that's becoming too big
      switch (message.type) {
        case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE
          .AUTHORIZATION_REQUEST_MESSAGE_TYPE: {
          const requestData = message as AuthorizationRequestMessage

          const url = new URL(requestData.body.callbackUrl) // TODO: Handle error

          if (requestData.body?.scope && requestData.body.scope.length) {
            // We have a scope object implying we need to submit a ZK proof
            const screenParams: ProofRequestScreenParams = {
              name: entityMetadata.name || 'Unknown',
              logo: entityMetadata.icon,
              details: {
                protocols: ['polygonid'],
                timestamp: new Date().toISOString(),
                url: url.origin,
                requesterId: requestData.from || 'Unknown',
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
              name: entityMetadata.name || 'Unknown',
              logo: entityMetadata.icon,
              details: {
                protocols: ['polygonid'],
                timestamp: new Date().toISOString(),
                url: url.origin,
                requesterId: requestData.from || 'Unknown',
                message: requestData.body?.reason,
              },
              data: requestData,
            }
            if (replaceNavigationScreen) {
              navigation.replace('PolygonIdConnectionRequest', screenParams)
            } else {
              navigation.navigate('PolygonIdConnectionRequest', screenParams)
            }
          }
          return
        }
        case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE
          .CREDENTIAL_OFFER_MESSAGE_TYPE: {
          const offerData = message as CredentialsOfferMessage

          const screenParams: IncomingDataRequestScreenParams = {
            name: entityMetadata.name || 'Unknown',
            logo: entityMetadata.icon,
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
          logger.warn(`Polygon ID message type not supported`, {
            messageType: message.type,
          })
          throw new Error(
            `Polygon ID message type not supported: ${message.type}}`
          )
        }
      }
    },
    [navigation]
  )

  const handleDeepLinkUrl = useCallback(
    async (url: string) => {
      try {
        const message = await parsePolygonIdMessage(url)
        handleMessage(message, false)
        // Assuming the deep link doesn't come from a particular screen so we don't replace it.
      } catch (error: unknown) {
        // TODO: Display an Alert to the user as there are no other feedback
        logger.error(error)
      }
    },
    [handleMessage]
  )

  const handleQRCodeMessage = useCallback(
    async (qrCodeMessage: string) => {
      try {
        const message = await parsePolygonIdMessage(qrCodeMessage)
        handleMessage(message, true)
        // Assuming the QR Code comes from the scanner screen, we replace this screen, so when the user is finished with the Polygon ID screen, they go back to the previous screen, not the QR Code scanner screen
      } catch (error: unknown) {
        // TODO: Display an Alert to the user as there are no other feedback
        logger.error(error)
      }
    },
    [handleMessage]
  )

  const contextValue: PolygonIdProtocolContextType = useMemo(
    () => ({
      handleDeepLinkUrl,
      handleQRCodeMessage,
    }),
    [handleDeepLinkUrl, handleQRCodeMessage]
  )

  return (
    <PolygonIdProtocolContext.Provider value={contextValue}>
      {children}
    </PolygonIdProtocolContext.Provider>
  )
}

import type {
  AuthorizationRequestMessage,
  CredentialsOfferMessage,
} from '@0xpolygonid/js-sdk'
import * as Sentry from '@sentry/react-native'
import { base64 } from 'ethers/lib/utils' // TODO: Is it ok to use the base64 from the ethers package?
import {
  IDEN3_PROTOCOL,
  IDEN3_PROTOCOL_DEEPLINK_DATA_PARAM,
  IDEN3_PROTOCOL_DEEPLINK_SCHEME,
  PROTOCOL_MESSAGE_TYPE,
} from 'features/polygonid/constants'

function checkParsedMessage(
  parsedMessage: Record<string, unknown>,
  originalMessage: string
) {
  // For now, merely checking the parsedMessage is not null/undefined/empty. Could add stronger checks.
  if (parsedMessage) {
    return
  }

  const error = new Error(`Invalid Polygon ID message`)
  Sentry.captureException(error, {
    tags: {
      originalMessage,
      parsedMessage,
    },
  })

  throw error
}

export function parseMessage(
  message: Record<string, unknown>
): AuthorizationRequestMessage | CredentialsOfferMessage {
  switch (message.type) {
    case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE:
      // Either a Connection request or a ZK Proof request
      return message as AuthorizationRequestMessage
    case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE:
      // Offer to save a new ZK credential
      return message as CredentialsOfferMessage
    default:
      throw new Error(`Polygon ID message type not supported: ${message.type}}`)
  }
}

export function isPolygonIdDeepLink(url: string) {
  return url.toLowerCase().startsWith(IDEN3_PROTOCOL_DEEPLINK_SCHEME)
}

export function parseDeepLinkUrl(url: string) {
  const urlObj = new URL(url)
  const base64Message = urlObj.searchParams.get(
    IDEN3_PROTOCOL_DEEPLINK_DATA_PARAM
  )
  if (!base64Message) {
    throw new Error('Invalid PolygonID deeplink')
  }

  const unint8Message = base64.decode(base64Message)
  const decodedString = new TextDecoder().decode(unint8Message)
  const jsonMessage = JSON.parse(decodedString)
  checkParsedMessage(jsonMessage, url)
  return parseMessage(jsonMessage)
}

export function isPolygonIdQrCodeMessage(qrCodeMessage: string) {
  return !!qrCodeMessage?.match(IDEN3_PROTOCOL)?.length
}

export function parseQrCodeMessage(
  qrCodeMessage: string
): AuthorizationRequestMessage | CredentialsOfferMessage {
  const jsonMessage = JSON.parse(qrCodeMessage)
  checkParsedMessage(jsonMessage, qrCodeMessage)
  return parseMessage(jsonMessage)
}

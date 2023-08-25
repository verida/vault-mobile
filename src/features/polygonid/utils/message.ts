import type {
  AuthorizationRequestMessage,
  CredentialsOfferMessage,
} from '@0xpolygonid/js-sdk'
import axios from 'axios'
import { base64 } from 'ethers/lib/utils' // TODO: Is it ok to use the base64 from the ethers package?
import {
  IDEN3_PROTOCOL,
  IDEN3_PROTOCOL_DEEPLINK_DATA_PARAM,
  IDEN3_PROTOCOL_DEEPLINK_SCHEME,
  PROTOCOL_MESSAGE_TYPE,
} from 'features/polygonid/constants'
import { Logger } from 'features/telemetry'

const logger = new Logger('Polygon ID')

function checkParsedMessage(
  parsedMessage: Record<string, unknown>,
  originalMessage: string
) {
  // For now, merely checking the parsedMessage is not null/undefined/empty. Could add stronger checks.
  if (parsedMessage) {
    return
  }

  const error = new Error(`Invalid Polygon ID message`)
  logger.error(error, {
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

export async function fetchEntityMetadata(
  url: string
): Promise<{ name?: string; avatar?: string; url: string; hostname: string }> {
  const parsedUrl = new URL(url)

  let html = ''
  try {
    // Fetching the page content of the origin, not the full URL as it's likely a REST API route.
    const { data } = await axios.get<string>(parsedUrl.origin)
    html = data
  } catch (_error: unknown) {
    // Something went wrong fetching the origin, likely th epage doesn't exist.
    // It's ok, we can't assume all entities are setting up a page there.
    // The subsequent logic has fallbacks if there is no page available
  }

  const titleRegex = /<title>(.*?)<\/title>/i
  const titleMatch = titleRegex.exec(html)
  const title = titleMatch ? titleMatch[1] : parsedUrl.hostname

  const iconRegex = /<link\s+rel="(?:shortcut )?icon"\s+[^>]*href="([^"]+)"/i
  const iconMatch = iconRegex.exec(html)
  const iconPath = iconMatch ? iconMatch[1] : 'favicon.ico'
  const iconUrl = iconPath.startsWith('http')
    ? iconPath
    : `${parsedUrl.origin}/${iconPath}`

  return {
    name: title,
    avatar: iconUrl,
    url: parsedUrl.origin,
    hostname: parsedUrl.hostname,
  }
}

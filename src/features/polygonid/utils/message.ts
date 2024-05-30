import {
  AuthorizationRequestMessage,
  CredentialsOfferMessage,
  PROTOCOL_CONSTANTS,
} from '@0xpolygonid/js-sdk'
import axios from 'axios'
import { base64 } from 'ethers/lib/utils' // TODO: Is it ok to use the base64 from the ethers package?

import { DidMetadata, getDidMetadata, saveDidMetadata } from '~/features/did'
import { Logger } from '~/features/telemetry'

import {
  IDEN3_PROTOCOL,
  IDEN3_PROTOCOL_DEEPLINK_DATA_PARAM,
  IDEN3_PROTOCOL_DEEPLINK_REQUEST_PARAM,
  IDEN3_PROTOCOL_DEEPLINK_SCHEME,
} from '../constants'

const logger = Logger.create('PolygonId')

export function isPolygonIdMessage(message: string) {
  return (
    message.toLowerCase().startsWith(IDEN3_PROTOCOL_DEEPLINK_SCHEME) ||
    !!message?.match(IDEN3_PROTOCOL)?.length
  )
}

function isUriMessage(message: string) {
  // URI message starts with the iden3 scheme: iden3comm://?...
  return message.toLowerCase().startsWith(IDEN3_PROTOCOL_DEEPLINK_SCHEME)
}

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

async function fetchMessageFromUri(
  url: string
): Promise<Record<string, unknown>> {
  logger.debug('Fetching Polygon ID message from request_uri')
  try {
    const response = await axios.get(url)
    logger.debug('Fetching Polygon ID message from request_uri successful')
    return response.data
  } catch (error) {
    logger.error(
      new Error(`Failed to fetch Polygon ID message from request_uri`, {
        cause: error,
      })
    )
    throw error
  }
}

function decodeMessage(base64Message: string): Record<string, unknown> {
  const unint8Message = base64.decode(base64Message)
  const decodedString = new TextDecoder().decode(unint8Message)
  return JSON.parse(decodedString)
}

function parseUriMessage(message: string) {
  const urlObj = new URL(message)

  const base64Message = urlObj.searchParams.get(
    IDEN3_PROTOCOL_DEEPLINK_DATA_PARAM
  )

  if (base64Message) {
    logger.debug('Polygon ID message is an embedded encoded message')
    return decodeMessage(base64Message)
  }

  const requestUri = urlObj.searchParams.get(
    IDEN3_PROTOCOL_DEEPLINK_REQUEST_PARAM
  )

  if (requestUri) {
    logger.debug('Polygon ID message is a request URI to fetch')
    return fetchMessageFromUri(requestUri)
  }

  logger.warn('The Polygon ID message is invalid')
  throw new Error('Invalid Polygon ID message')
}

function parseMessage(
  message: Record<string, unknown>
): AuthorizationRequestMessage | CredentialsOfferMessage {
  switch (message.type) {
    case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE
      .AUTHORIZATION_REQUEST_MESSAGE_TYPE:
      // Either a Connection request or a ZK Proof request
      return message as AuthorizationRequestMessage
    case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE:
      // Offer to save a new ZK credential
      return message as CredentialsOfferMessage
    default:
      throw new Error(`Polygon ID message type not supported: ${message.type}}`)
  }
}

export async function parsePolygonIdMessage(message: string) {
  let jsonMessage: Record<string, unknown>

  if (isUriMessage(message)) {
    jsonMessage = await parseUriMessage(message)
  } else {
    logger.debug('Polygon ID message is a raw JSON message')
    jsonMessage = JSON.parse(message)
  }

  checkParsedMessage(jsonMessage, message)
  return parseMessage(jsonMessage)
}

export async function fetchEntityMetadata(url: string): Promise<DidMetadata> {
  logger.info('Fetching metadata from URL')

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
    icon: iconUrl,
  }
}

export async function getEntityMetadata(
  did: string,
  url?: string
): Promise<DidMetadata> {
  logger.debug('Getting Polygon ID entity metadata')
  try {
    const [didMetadata, fetchedMetadata] = await Promise.all([
      getDidMetadata(did),
      url ? fetchEntityMetadata(url) : Promise.resolve(undefined),
    ])

    logger.debug('didMetadata', { didMetadata })
    logger.debug('fetchedMetadata', { fetchedMetadata })

    if (fetchedMetadata) {
      logger.debug('Saving the fetched metadata into the DID metadata store')

      saveDidMetadata(did, {
        name: fetchedMetadata.name,
        icon: fetchedMetadata.icon,
      })
    }

    return {
      name: fetchedMetadata?.name || didMetadata?.name,
      icon: fetchedMetadata?.icon || didMetadata?.icon,
    }
  } catch (error) {
    logger.error(new Error('Error getting entity metadata', { cause: error }))
    return {}
  }
}

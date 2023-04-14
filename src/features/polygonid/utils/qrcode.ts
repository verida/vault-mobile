import {
  AuthorizationRequestMessage,
  CredentialsOfferMessage,
  PROTOCOL_CONSTANTS,
} from '@0xpolygonid/js-sdk'

export function parseQrCodeMessage(
  qrCodeMessage: string
): AuthorizationRequestMessage | CredentialsOfferMessage {
  const result = JSON.parse(qrCodeMessage)

  switch (result.type) {
    case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE
      .AUTHORIZATION_REQUEST_MESSAGE_TYPE:
      // Either a Connection request or a ZK Proof request
      return result as AuthorizationRequestMessage
    case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE:
      // Offer to save a new ZK credential
      return result as CredentialsOfferMessage
    default:
      throw new Error('Polygon ID QR code message not supported')
  }
}

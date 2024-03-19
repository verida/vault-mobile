import { CredentialStatusType } from '@0xpolygonid/js-sdk'

export type PolygonIdIdentityConfig = {
  blockchain: string
  networkId: string
  didMethod: string
  revocationBaseUrl: string
  revocationType: CredentialStatusType
}

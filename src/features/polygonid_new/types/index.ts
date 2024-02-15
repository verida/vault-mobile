import { CredentialStatusType } from '@0xpolygonid/js-sdk'

export type WitnessCalculatorFunction = (
  wasm: Uint8Array,
  data: JSON
) => Promise<string>

export type PolygonIdConfig = {
  polygonIdBlockchain: string
  polygonIdNetworkId: string
  polygonIdDidMethod: string
  polygonIdRevocationBaseUrl: string
  polygonIdRevocationType: CredentialStatusType
  polygonIdRpcUrl: string
  polygonIdContractAddress: string
  polygonIdIpfsGatewayUrl?: string
}

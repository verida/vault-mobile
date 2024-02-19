export const IDEN3_PROTOCOL_DEEPLINK_SCHEME = 'iden3comm://'
export const IDEN3_PROTOCOL_DEEPLINK_DATA_PARAM = 'i_m'
export const IDEN3_PROTOCOL_DEEPLINK_REQUEST_PARAM = 'request_uri'

export const IDEN3_PROTOCOL = 'https://iden3-communication.io/'

export enum Blockchain {
  Ethereum = 'eth',
  Polygon = 'polygon',
  Unknown = 'unknown',
  NoChain = '',
}
export enum NetworkId {
  Main = 'main',
  Mumbai = 'mumbai',
  Goerli = 'goerli',
  Unknown = 'unknown',
  NoNetwork = '',
}
export enum DidMethod {
  Iden3 = 'iden3',
  PolygonId = 'polygonid',
}

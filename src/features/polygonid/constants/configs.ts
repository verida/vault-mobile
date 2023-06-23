import { PolygonIdManagerConfig } from 'features/polygonid/polygon'

import { Blockchain, CredentialStatusType, DidMethod, NetworkId } from './iden3'

type PolygonIdPartialConfig = Pick<
  PolygonIdManagerConfig,
  | 'polygonIdBlockchain'
  | 'polygonIdNetworkId'
  | 'polygonIdDidMethod'
  | 'polygonIdRevocationBaseUrl'
  | 'polygonIdRevocationType'
  | 'polygonIdRpcUrl'
  | 'polygonIdContractAddress'
>

// TODO: Ask Polygon ID team about revocation

// TODO: Get the values from the enums once the Polygon ID SDK can be added without issue

export const polygonIdTestnetConfig: PolygonIdPartialConfig = {
  polygonIdBlockchain: Blockchain.Polygon,
  polygonIdNetworkId: NetworkId.Mumbai,
  polygonIdDidMethod: DidMethod.PolygonId,
  // polygonIdRevocationBaseUrl: 'https://rhs-staging.polygonid.me/',
  polygonIdRevocationBaseUrl: '',
  polygonIdRevocationType:
    CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
  polygonIdRpcUrl: 'https://rpc-mumbai.maticvigil.com',
  polygonIdContractAddress: '0x134B1BE34911E39A8397ec6289782989729807a4', // Mumbai address
}

export const polygonIdMainnetConfig: PolygonIdPartialConfig = {
  polygonIdBlockchain: Blockchain.Polygon,
  polygonIdNetworkId: NetworkId.Main,
  polygonIdDidMethod: DidMethod.PolygonId,
  polygonIdRevocationBaseUrl: '',
  polygonIdRevocationType:
    CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
  polygonIdRpcUrl: 'https://rpc-mainnet.maticvigil.com',
  polygonIdContractAddress: '0x624ce98D2d27b20b8f8d521723Df8fC4db71D79D', // Mainnet address
}

export const BLOCKCHAIN_SLICE_NAME = 'blockchain'

// Keep BLOCKCHAIN_NAMESPACES and BLOCKCHAIN_NAMESPACE_DEFINITIONS in sync
export const BLOCKCHAIN_NAMESPACES = ['eip155', 'near'] as const
export const BLOCKCHAIN_NAMESPACE_DEFINITIONS = {
  eip155: {
    shortLabel: 'EVM',
    longLabel: 'EVM (Ethereum, Polygon, etc.)',
  },
  near: {
    shortLabel: 'NEAR',
    longLabel: 'NEAR',
  },
}

export const CUSTOM_BLOCKCHAIN_SCHEMA_URL =
  'https://vault.schemas.verida.io/blockchain/custom-networks/v0.1.0/schema.json'

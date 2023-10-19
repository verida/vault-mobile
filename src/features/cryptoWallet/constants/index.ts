import { SUPPORTED_BLOCKCHAIN_NAMESPACES } from 'features/caip'

export const WALLET_SCHEMA_0_2_0_URI =
  'https://vault.schemas.verida.io/wallets/v0.2.0/schema.json'

// TODO: Register this scheme on iOS and Android for deep links
export const SUPPORTED_BLOCKCHAIN_REQUEST_URL_SCHEMES = [
  'ethereum',
  ...SUPPORTED_BLOCKCHAIN_NAMESPACES,
]

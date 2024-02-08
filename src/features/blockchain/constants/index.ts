import { SupportedBlockchainNamespace } from 'features/blockchain/@types'
import { $enum } from 'ts-enum-util'

export const SUPPORTED_BLOCKCHAIN_NAMESPACES = [
  ...$enum(SupportedBlockchainNamespace).values(),
]

export const CUSTOM_BLOCKCHAIN_SCHEMA_URL =
  'https://vault.schemas.verida.io/blockchain/custom-networks/v0.1.0/schema.json'

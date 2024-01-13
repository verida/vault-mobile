import { SupportedBlockchainNamespace } from 'features/blockchain/@types'
import { $enum } from 'ts-enum-util'

export const SUPPORTED_BLOCKCHAIN_NAMESPACES = [
  ...$enum(SupportedBlockchainNamespace).values(),
]

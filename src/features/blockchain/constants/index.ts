import { SupportedBlockchainNamespace } from 'features/blockchain/@types'
import { $enum } from 'ts-enum-util'

// @aurelticot: I think it's more relevant in the 'blockchains' feature but didn't want to refactor everything using the constant from the 'caip' feature.
// I was not able to use the 'caip' constant, though, because of a weird circular dependency. Hence the duplication here.
// TODO: Remove the 'caip' constant and use this one instead.
export const SUPPORTED_BLOCKCHAIN_NAMESPACES = [
  ...$enum(SupportedBlockchainNamespace).values(),
]

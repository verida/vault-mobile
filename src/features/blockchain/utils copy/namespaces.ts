import { BLOCKCHAIN_NAMESPACE_DEFINITIONS } from '../constants'
import { BlockchainNamespace } from '../types'

export function getBlockchainNamespaceShortLabel(
  namespace: BlockchainNamespace
) {
  return BLOCKCHAIN_NAMESPACE_DEFINITIONS[namespace].shortLabel
}

export function getBlockchainNamespaceLongLabel(
  namespace: BlockchainNamespace
) {
  return BLOCKCHAIN_NAMESPACE_DEFINITIONS[namespace].longLabel
}

import { BlockchainNamespace } from '../@types'
import { BLOCKCHAIN_NAMESPACE_DEFINITIONS } from '../constants'

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

import {
  BLOCKCHAIN_NAMESPACE_DEFINITIONS,
  BLOCKCHAIN_NAMESPACES,
} from '../constants'
import { BlockchainNamespace } from '../types'
import { SupportedBlockchainNamespace } from '../types/enums'

export function isSupportedBlockchainNamespace(
  blockchainNamespace: string | undefined
): blockchainNamespace is SupportedBlockchainNamespace {
  if (!blockchainNamespace) {
    return false
  }

  return BLOCKCHAIN_NAMESPACES.includes(blockchainNamespace as any)
}

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

import { BLOCKCHAIN_NAMESPACES } from '../constants'
import { SupportedBlockchainNamespace } from '../types/enums'

export function isSupportedCaipNamespace(
  blockchainNamespace: string | undefined
): blockchainNamespace is SupportedBlockchainNamespace {
  if (!blockchainNamespace) return false

  return BLOCKCHAIN_NAMESPACES.includes(blockchainNamespace as any)
}

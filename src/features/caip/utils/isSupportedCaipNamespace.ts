import { SUPPORTED_BLOCKCHAIN_NAMESPACES } from 'features/caip/constants'

import { SupportedCaipNamespace } from '../@types'

export function isSupportedCaipNamespace(
  maybeSupportedCaipProtocol: string | undefined
): maybeSupportedCaipProtocol is SupportedCaipNamespace {
  if (!maybeSupportedCaipProtocol) return false

  return SUPPORTED_BLOCKCHAIN_NAMESPACES.map(String).includes(
    maybeSupportedCaipProtocol
  )
}

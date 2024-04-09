import { $enum } from 'ts-enum-util'

import { SupportedBlockchainNamespace } from '../types/enums'

export function isSupportedCaipNamespace(
  maybeSupportedCaipProtocol: string | undefined
): maybeSupportedCaipProtocol is SupportedBlockchainNamespace {
  if (!maybeSupportedCaipProtocol) return false

  return [...$enum(SupportedBlockchainNamespace).values()]
    .map(String)
    .includes(maybeSupportedCaipProtocol)
}

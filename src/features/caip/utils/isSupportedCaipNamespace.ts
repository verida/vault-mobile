import { SupportedBlockchainNamespace } from 'features/blockchain/@types/enums'
import { $enum } from 'ts-enum-util'

export function isSupportedCaipNamespace(
  maybeSupportedCaipProtocol: string | undefined
): maybeSupportedCaipProtocol is SupportedBlockchainNamespace {
  if (!maybeSupportedCaipProtocol) return false

  return [...$enum(SupportedBlockchainNamespace).values()]
    .map(String)
    .includes(maybeSupportedCaipProtocol)
}

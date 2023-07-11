import { $enum } from 'ts-enum-util'

import { SupportedCaipProtocolStandard } from '../@types'

export function isSupportedCaipProtocol(
  maybeSupportedCaipProtocol: string | undefined
): maybeSupportedCaipProtocol is SupportedCaipProtocolStandard {
  if (!maybeSupportedCaipProtocol) return false

  return [...$enum(SupportedCaipProtocolStandard).values()]
    .map(String)
    .includes(maybeSupportedCaipProtocol)
}

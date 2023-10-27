import { $enum } from 'ts-enum-util'

import { SupportedCaipNamespace } from '../@types'

export function isSupportedCaipNamespace(
  maybeSupportedCaipProtocol: string | undefined
): maybeSupportedCaipProtocol is SupportedCaipNamespace {
  if (!maybeSupportedCaipProtocol) return false

  return [...$enum(SupportedCaipNamespace).values()]
    .map(String)
    .includes(maybeSupportedCaipProtocol)
}

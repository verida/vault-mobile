import { ParsedCaipType } from '../@types'
import { getMaybeChainName } from '../constants'
import { stringifyCaip } from '../utils/stringifyCaip'

const UNSUPPORTED_CHAIN_FRIENDLY_NAME = 'Unsupported Network'

export function getSupportedCaipProtocolFriendlyName(
  parsedCaipType: ParsedCaipType | null | undefined
): string {
  if (!parsedCaipType) return UNSUPPORTED_CHAIN_FRIENDLY_NAME

  const caip = stringifyCaip({
    parsedCaipType,
    suppressAddressComponent: true,
  })

  return getMaybeChainName(parsedCaipType) || caip
}

import { ChainMetadatas, ParsedCaipType } from '../@types'
import { stringifyCaip } from '../utils/stringifyCaip'
import { getMaybeChainName } from './getMaybeChainName'

const UNSUPPORTED_CHAIN_FRIENDLY_NAME = 'Unsupported Network'

export function getSupportedCaipProtocolFriendlyName(
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType | null | undefined
): string {
  if (!parsedCaipType) return UNSUPPORTED_CHAIN_FRIENDLY_NAME

  const caip = stringifyCaip({
    parsedCaipType,
    suppressAddressComponent: true,
  })

  return getMaybeChainName(chainMetadatas, parsedCaipType) || caip
}

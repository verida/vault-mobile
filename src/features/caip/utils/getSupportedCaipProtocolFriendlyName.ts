import { ChainMetadatas, ParsedCaipType } from '../@types'
import { stringifyCaip } from '../utils/stringifyCaip'
import { getMaybeChainName } from './getMaybeChainName'

export function getSupportedCaipProtocolFriendlyName(
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType | null | undefined
): string {
  if (!parsedCaipType) return 'Unknown'

  const caip = stringifyCaip({
    parsedCaipType,
    suppressAddressComponent: true,
  })

  return getMaybeChainName(chainMetadatas, parsedCaipType) || caip
}

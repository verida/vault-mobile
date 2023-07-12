import {
  ChainMetadata,
  ChainMetadatas,
  ParsedCaipType,
  SupportedCaipProtocolStandard,
} from '../@types'
import { isChainMetadataMatchingStandard } from './isChainMetadataMatchingStandard'
import { stringifyCaip } from './stringifyCaip'

export const getMaybeChainMetadataByCaipType = <
  T extends SupportedCaipProtocolStandard
>(
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType<T> | undefined
): ChainMetadata<T> | undefined => {
  if (!parsedCaipType) return undefined

  const {
    [stringifyCaip({ parsedCaipType, suppressAddressComponent: true })]:
      maybeChainMetadata,
  } = chainMetadatas

  const { standard } = parsedCaipType

  if (
    !maybeChainMetadata ||
    !isChainMetadataMatchingStandard(maybeChainMetadata, standard)
  )
    return undefined

  return maybeChainMetadata
}

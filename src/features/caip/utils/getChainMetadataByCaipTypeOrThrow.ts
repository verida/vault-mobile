import { ChainMetadata, ChainMetadatas, ParsedCaipType } from '../@types'
import { getMaybeChainMetadataByCaipType } from './getMaybeChainMetadataByCaipType'
import { stringifyCaip } from './stringifyCaip'

export const getChainMetadataByCaipTypeOrThrow = (
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType
): ChainMetadata => {
  const maybeChainMetadata = getMaybeChainMetadataByCaipType(
    chainMetadatas,
    parsedCaipType
  )

  if (!maybeChainMetadata)
    throw new Error(
      `Unable to determine ChainMetadata for "${stringifyCaip({
        parsedCaipType,
        suppressAddressComponent: true,
      })}".`
    )

  return maybeChainMetadata
}

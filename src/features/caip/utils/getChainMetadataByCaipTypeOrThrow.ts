import {
  ChainMetadata,
  ChainMetadatas,
  ParsedCaipType,
  SupportedCaipProtocolStandard,
} from '../@types'
import { getMaybeChainMetadataByCaipType } from './getMaybeChainMetadataByCaipType'
import { stringifyCaip } from './stringifyCaip'

export const getChainMetadataByCaipTypeOrThrow = <
  T extends SupportedCaipProtocolStandard
>(
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType<T>
): ChainMetadata<T> => {
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

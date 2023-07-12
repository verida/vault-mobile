import { ChainMetadatas, ParsedCaipType } from '../@types'
import { getMaybeChainMetadataByCaipType } from './getMaybeChainMetadataByCaipType'

export const getMaybeChainName = (
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType
) => getMaybeChainMetadataByCaipType(chainMetadatas, parsedCaipType)?.name

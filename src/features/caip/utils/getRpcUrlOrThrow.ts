import { ChainMetadatas, ParsedCaipType } from '../@types'
import { getChainMetadataByCaipTypeOrThrow } from './getChainMetadataByCaipTypeOrThrow'

export const getRpcUrlOrThrow = (
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType
) => getChainMetadataByCaipTypeOrThrow(chainMetadatas, parsedCaipType).rpc

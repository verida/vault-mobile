import {
  ChainMetadatas,
  ParsedCaipType,
  SupportedCaipProtocolStandard,
} from '../@types'
import { getChainMetadataByCaipTypeOrThrow } from './getChainMetadataByCaipTypeOrThrow'

export const getRpcUrlOrThrow = <T extends SupportedCaipProtocolStandard>(
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType<T>
) => getChainMetadataByCaipTypeOrThrow(chainMetadatas, parsedCaipType).rpc

import {
  ChainMetadatas,
  ParsedCaipType,
  SupportedCaipProtocolStandard,
} from '../@types'
import { getMaybeChainMetadataByCaipType } from './getMaybeChainMetadataByCaipType'

export const getMaybeChainName = <T extends SupportedCaipProtocolStandard>(
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType<T>
) => getMaybeChainMetadataByCaipType(chainMetadatas, parsedCaipType)?.name

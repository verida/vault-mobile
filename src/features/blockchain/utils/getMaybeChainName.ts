import { ChainId } from 'caip'

import { ChainMetadata } from '../types'
import { getMaybeChainMetadataByCaipChainId } from './getMaybeChainMetadataByCaipChainId'

export const getMaybeChainName = (
  chainMetadatas: ChainMetadata[],
  caipChainId: ChainId
) => getMaybeChainMetadataByCaipChainId(chainMetadatas, caipChainId)?.name

import { ChainId } from 'caip'

import { ChainMetadatas } from '../types'
import { getMaybeChainMetadataByCaipChainId } from './getMaybeChainMetadataByCaipChainId'

export const getMaybeChainName = (
  chainMetadatas: ChainMetadatas,
  caipChainId: ChainId
) => getMaybeChainMetadataByCaipChainId(chainMetadatas, caipChainId)?.name

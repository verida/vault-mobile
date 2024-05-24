import { ChainId } from 'caip'

import { Blockchain } from '../types'
import { getMaybeChainMetadataByCaipChainId } from './getMaybeChainMetadataByCaipChainId'

export const getMaybeChainName = (
  chainMetadatas: Blockchain[],
  caipChainId: ChainId
) => getMaybeChainMetadataByCaipChainId(chainMetadatas, caipChainId)?.name

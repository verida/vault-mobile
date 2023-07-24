import { ChainId } from 'caip'

import { ChainMetadatas } from '../@types'
import { getChainMetadataByCaipTypeOrThrow } from './getChainMetadataByCaipTypeOrThrow'

export const getRpcUrlOrThrow = (
  chainMetadatas: ChainMetadatas,
  chainId: ChainId
) => getChainMetadataByCaipTypeOrThrow(chainMetadatas, chainId).rpc

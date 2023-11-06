import { ChainId } from 'caip'
import { RpcSelector } from 'features/blockchain/@types'

import { ChainMetadatas } from '../@types'
import { getChainMetadataByCaipTypeOrThrow } from './getChainMetadataByCaipTypeOrThrow'

export const getRpcUrlOrThrow = ({
  chainId,
  chainMetadatas,
  rpcSelector,
}: {
  readonly chainId: ChainId
  readonly chainMetadatas: ChainMetadatas
  readonly rpcSelector: RpcSelector
}): Promise<string> => {
  const { rpcUrls } = getChainMetadataByCaipTypeOrThrow(chainMetadatas, chainId)
  return rpcSelector(rpcUrls)
}

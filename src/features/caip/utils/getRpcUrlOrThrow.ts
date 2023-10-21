import { ChainId } from 'caip'
import { RpcSelector } from 'features/walletConnect'

import { ChainMetadatas } from '../@types'
import { getChainMetadataByCaipTypeOrThrow } from './getChainMetadataByCaipTypeOrThrow'

// TODO: Here we are taking away decision making from the caller - for simplicity, we are selecting the first
//       url, but this should not always be the case.
export const getRpcUrlOrThrow = ({
  chainId,
  chainMetadatas,
  rpcSelector,
}: {
  readonly chainId: ChainId
  readonly chainMetadatas: ChainMetadatas
  readonly rpcSelector: RpcSelector
}) => {
  const { rpcUrls } = getChainMetadataByCaipTypeOrThrow(chainMetadatas, chainId)
  return rpcSelector(rpcUrls)
}

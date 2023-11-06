import { ChainId } from 'caip'

import { ChainMetadataRpc, ChainMetadatas } from '../@types'
import { getChainMetadataByCaipTypeOrThrow } from './getChainMetadataByCaipTypeOrThrow'

export const getRpcUrlOrThrow = ({
  chainId,
  chainMetadatas,
}: {
  readonly chainId: ChainId
  readonly chainMetadatas: ChainMetadatas
}): string => {
  const { rpcUrls } = getChainMetadataByCaipTypeOrThrow(chainMetadatas, chainId)

  if (!rpcUrls.length) throw new Error('Expected at least a single RPC.')

  // HACK: Here we just select the first RPC in the array.
  //       In future, it might be beneficial to allow a user to choose
  //       the RPC to use.
  const [maybeRpcUrl] = rpcUrls

  return ChainMetadataRpc.parse(maybeRpcUrl)
}

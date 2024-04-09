import { ChainId } from 'caip'

import { ChainMetadataRpc, ChainMetadatas } from '../types'
import { getChainMetadataByCaipTypeOrThrow } from './getChainMetadataByCaipTypeOrThrow'

// HACK: This is used to normalize all of our attempts to access
//       the first element of an array of rpcURLs. We can pivot
//       all related business logic around this assumption
//
//       In future, it might be beneficial to allow a user to choose
//       the RPC to use.
export const HACK__getFirstRpcUrl = (rpcUrls: unknown): string | undefined => {
  if (!Array.isArray(rpcUrls) || !rpcUrls.length) return undefined

  const [maybeRpcUrl] = rpcUrls

  return ChainMetadataRpc.parse(maybeRpcUrl)
}

export const getRpcUrlOrThrow = ({
  chainId,
  chainMetadatas,
}: {
  readonly chainId: ChainId
  readonly chainMetadatas: ChainMetadatas
}): string => {
  const { rpcUrls } = getChainMetadataByCaipTypeOrThrow(chainMetadatas, chainId)

  const maybeRpcUrl = HACK__getFirstRpcUrl(rpcUrls)

  if (typeof maybeRpcUrl !== 'string' || !maybeRpcUrl.length)
    throw new Error('Expected at least a single RPC.')

  return maybeRpcUrl
}

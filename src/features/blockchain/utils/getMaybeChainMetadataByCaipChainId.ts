import { ChainId } from 'caip'

import { Blockchain } from '../types'
import { isChainMetadataMatchingNamespace } from './isChainMetadataMatchingNamespace'
import { isSupportedCaipNamespace } from './isSupportedCaipNamespace'

export const getMaybeChainMetadataByCaipChainId = (
  chainMetadatas: Blockchain[],
  caipChainId: ChainId | undefined
): Blockchain | undefined => {
  if (!caipChainId) return undefined

  // TODO: It is possible for ChainMetadatas can contain duplicate
  //       configuration settings for the same chainId. Ideally, a user
  // .     would select specific settings for different scenarios - here,
  //       we are taking that choice away from the user.
  const maybeChainMetadata = chainMetadatas.find(
    (chainMetdata: Blockchain) =>
      new ChainId(chainMetdata).toString() === caipChainId.toString()
  )

  const { namespace } = caipChainId

  if (
    !maybeChainMetadata ||
    !isSupportedCaipNamespace(namespace) ||
    !isChainMetadataMatchingNamespace(maybeChainMetadata, namespace)
  )
    return undefined

  return maybeChainMetadata
}

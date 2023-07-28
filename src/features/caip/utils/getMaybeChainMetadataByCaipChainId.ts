import { ChainId } from 'caip'
import { isSupportedCaipNamespace } from 'features/caip'

import { ChainMetadata, ChainMetadatas } from '../@types'
import { isChainMetadataMatchingNamespace } from './isChainMetadataMatchingNamespace'

export const getMaybeChainMetadataByCaipChainId = (
  chainMetadatas: ChainMetadatas,
  caipChainId: ChainId | undefined
): ChainMetadata | undefined => {
  if (!caipChainId) return undefined

  const { [caipChainId.toString()]: maybeChainMetadata } = chainMetadatas

  const { namespace } = caipChainId

  if (
    !maybeChainMetadata ||
    !isSupportedCaipNamespace(namespace) ||
    !isChainMetadataMatchingNamespace(maybeChainMetadata, namespace)
  )
    return undefined

  return maybeChainMetadata
}

import { isSupportedCaipNamespace } from 'features/caip'

import { ChainMetadata, ChainMetadatas, ParsedCaipType } from '../@types'
import { isChainMetadataMatchingNamespace } from './isChainMetadataMatchingNamespace'
import { stringifyCaip } from './stringifyCaip'

export const getMaybeChainMetadataByCaipType = (
  chainMetadatas: ChainMetadatas,
  parsedCaipType: ParsedCaipType | undefined
): ChainMetadata | undefined => {
  if (!parsedCaipType) return undefined

  const {
    [stringifyCaip({ parsedCaipType, suppressAddressComponent: true })]:
      maybeChainMetadata,
  } = chainMetadatas

  const { namespace } = parsedCaipType

  if (
    !maybeChainMetadata ||
    !isSupportedCaipNamespace(namespace) ||
    !isChainMetadataMatchingNamespace(maybeChainMetadata, namespace)
  )
    return undefined

  return maybeChainMetadata
}

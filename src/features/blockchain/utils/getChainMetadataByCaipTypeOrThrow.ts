import { ChainId } from 'caip'

import { ChainMetadata } from '../types'
import { getMaybeChainMetadataByCaipChainId } from './getMaybeChainMetadataByCaipChainId'

export const getChainMetadataByCaipTypeOrThrow = (
  chainMetadatas: ChainMetadata[],
  chainId: ChainId
): ChainMetadata => {
  const maybeChainMetadata = getMaybeChainMetadataByCaipChainId(
    chainMetadatas,
    chainId
  )

  if (!maybeChainMetadata)
    throw new Error(
      `Unable to determine ChainMetadata for "${chainId.toString()}".`
    )

  return maybeChainMetadata
}

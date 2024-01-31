import { ChainId } from 'caip'

import { ChainMetadata, ChainMetadatas } from '../@types'
import { getMaybeChainMetadataByCaipChainId } from './getMaybeChainMetadataByCaipChainId'

export const getChainMetadataByCaipTypeOrThrow = (
  chainMetadatas: ChainMetadatas,
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

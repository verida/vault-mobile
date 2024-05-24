import { ChainId } from 'caip'

import { Blockchain } from '../types'
import { getMaybeChainMetadataByCaipChainId } from './getMaybeChainMetadataByCaipChainId'

export const getChainMetadataByCaipTypeOrThrow = (
  chainMetadatas: Blockchain[],
  chainId: ChainId
): Blockchain => {
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

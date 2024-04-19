import { ChainId } from 'caip'

import { ChainMetadata } from '../types'
import { getMaybeChainName } from './getMaybeChainName'

export function getSupportedCaipProtocolFriendlyName(
  chainMetadatas: ChainMetadata[],
  caipChainId: ChainId | null | undefined
): string {
  if (!caipChainId) return 'Unknown'

  return (
    getMaybeChainName(chainMetadatas, caipChainId) || caipChainId.toString()
  )
}

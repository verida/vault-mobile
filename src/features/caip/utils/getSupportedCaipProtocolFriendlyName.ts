import { ChainId } from 'caip'

import { ChainMetadatas } from '../@types'
import { getMaybeChainName } from './getMaybeChainName'

export function getSupportedCaipProtocolFriendlyName(
  chainMetadatas: ChainMetadatas,
  caipChainId: ChainId | null | undefined
): string {
  if (!caipChainId) return 'Unknown'

  return (
    getMaybeChainName(chainMetadatas, caipChainId) || caipChainId.toString()
  )
}

import { ChainId } from 'caip'

import { Blockchain } from '../types'
import { getMaybeChainName } from './getMaybeChainName'

export function getSupportedCaipProtocolFriendlyName(
  chainMetadatas: Blockchain[],
  caipChainId: ChainId | null | undefined
): string {
  if (!caipChainId) return 'Unknown'

  return (
    getMaybeChainName(chainMetadatas, caipChainId) || caipChainId.toString()
  )
}

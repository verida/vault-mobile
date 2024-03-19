import { SupportedBlockchainNamespace } from 'features/blockchain/@types/enums'

import { ChainMetadata } from '../@types'

export function isChainMetadataMatchingNamespace<
  T extends SupportedBlockchainNamespace,
>(chainMetadata: ChainMetadata, namespace: T): chainMetadata is ChainMetadata {
  const { namespace: maybeMatchingNamespace } = chainMetadata

  return maybeMatchingNamespace === namespace
}

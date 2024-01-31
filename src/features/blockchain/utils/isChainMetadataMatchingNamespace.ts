import { ChainMetadata, SupportedBlockchainNamespace } from '../@types'

export function isChainMetadataMatchingNamespace<
  T extends SupportedBlockchainNamespace
>(chainMetadata: ChainMetadata, namespace: T): chainMetadata is ChainMetadata {
  const { namespace: maybeMatchingNamespace } = chainMetadata

  return maybeMatchingNamespace === namespace
}

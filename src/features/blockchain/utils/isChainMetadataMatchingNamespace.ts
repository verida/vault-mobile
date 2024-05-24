import { Blockchain, SupportedBlockchainNamespace } from '../types'

export function isChainMetadataMatchingNamespace<
  T extends SupportedBlockchainNamespace,
>(chainMetadata: Blockchain, namespace: T): chainMetadata is Blockchain {
  const { namespace: maybeMatchingNamespace } = chainMetadata

  return maybeMatchingNamespace === namespace
}

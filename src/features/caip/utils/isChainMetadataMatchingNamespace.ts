import { ChainMetadata, SupportedCaipNamespace } from '../@types'

export function isChainMetadataMatchingNamespace<
  T extends SupportedCaipNamespace
>(chainMetadata: ChainMetadata, namespace: T): chainMetadata is ChainMetadata {
  const { namespace: maybeMatchingNamespace } = chainMetadata

  return maybeMatchingNamespace === namespace
}

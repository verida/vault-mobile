import { ChainMetadata, SupportedCaipProtocolStandard } from '../@types'

export function isChainMetadataMatchingStandard<
  T extends SupportedCaipProtocolStandard
>(
  chainMetadata: ChainMetadata<SupportedCaipProtocolStandard>,
  standard: T
): chainMetadata is ChainMetadata<T> {
  const { standard: maybeMatchingStandard } = chainMetadata

  return maybeMatchingStandard === standard
}

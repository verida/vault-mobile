import { ChainMetadata, CustomBlockchainNetwork } from '../@types'

export function chainMetadataToMaybeCustomBlockchainNetwork({
  chainMetadata: {
    name: label,
    rpcUrls,
    namespace,
    reference,
    decimals,
    nativeCurrencyName,
    symbol,
    isMainnet,
    icon,
    blockExplorers,
  },
}: {
  readonly chainMetadata: ChainMetadata
}): CustomBlockchainNetwork | undefined {
  const result = CustomBlockchainNetwork.safeParse({
    label,
    rpcUrls,
    chainId: { namespace, reference },
    nativeCurrency: { decimals, label: nativeCurrencyName, symbol },
    isMainnet,

    // TODO: This isn't supported by the JSONSchema... why?
    icon,

    blockExplorers,
  })

  if (!result.success) return undefined

  return result.data
}

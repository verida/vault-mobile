import { LegacyBlockchainSchema } from '../schemas'
import { ChainMetadata, CustomBlockchain } from '../types'

export function customBlockchainNetworkToMaybeChainMetadata({
  customBlockchainNetwork: {
    label: name,
    rpcUrls,
    chainId: { namespace, reference },
    nativeCurrency: { decimals, label: nativeCurrencyName, symbol },
    isMainnet,
    icon,
    blockExplorers,
  },
}: {
  readonly customBlockchainNetwork: CustomBlockchain
}): ChainMetadata | undefined {
  const result = LegacyBlockchainSchema.safeParse({
    name,
    rpcUrls,
    namespace,
    reference,
    decimals,
    isMainnet,
    nativeCurrencyName,
    symbol,
    icon,
    blockExplorers,
  })

  if (!result.success) return undefined

  return result.data
}

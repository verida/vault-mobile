import { z } from 'zod'

import { ChainMetadata } from '~/features/caip'

const CustomBlockchainNetworkLabel = z.string()

const CustomBlockchainNetworkRpcUrls = z.array(z.string().url()).nonempty()

const CustomBlockchainNetworkChainId = z.object({
  namespace: z.string(),
  reference: z.string(),
})

const CustomBlockchainNetworkIsMainnet = z.boolean().or(z.null())

const CustomBlockchainNetworkNativeCurrency = z.object({
  decimals: z.number().int().positive(),
  label: CustomBlockchainNetworkLabel,
  symbol: z.string(),
})

const CustomBlockchainNetworkBlockExplorer = z.object({
  label: CustomBlockchainNetworkLabel.or(z.null()).optional(),
  url: z.string().url(),
  standard: z.string().or(z.null()).optional(),
})

const CustomBlockchainNetworkBlockExplorers = z.array(
  CustomBlockchainNetworkBlockExplorer
)

const CustomBlockchainNetworkIcon = z.string().url().or(z.null())

export const CustomBlockchainNetwork = z.object({
  label: CustomBlockchainNetworkLabel,
  rpcUrls: CustomBlockchainNetworkRpcUrls,
  chainId: CustomBlockchainNetworkChainId,
  isMainnet: CustomBlockchainNetworkIsMainnet,
  nativeCurrency: CustomBlockchainNetworkNativeCurrency,
  blockExplorers: CustomBlockchainNetworkBlockExplorers,
  icon: CustomBlockchainNetworkIcon,
})

export type CustomBlockchainNetwork = z.infer<typeof CustomBlockchainNetwork>

export type CustomChains = {
  readonly loading: boolean
  readonly result: ChainMetadata[]
  readonly error?: Error
}

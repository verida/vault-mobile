import { z } from 'zod'

export const ChainMetadataRpc = z.string().url()

export type ChainMetadataRpc = z.infer<typeof ChainMetadataRpc>

export const ChainMetadataRpcs = z.array(ChainMetadataRpc).nonempty()

export type ChainMetadataRpcs = z.infer<typeof ChainMetadataRpcs>

export const ChainMetadata = z
  .object({
    // TODO: rename to chainName
    name: z.string(),
    rpcUrls: ChainMetadataRpcs,
    namespace: z.string(),
    reference: z.string(),
    decimals: z.number(),
    nativeCurrencyName: z.string(),
    symbol: z.string(),
    icon: z.string().or(z.null()),
  })
  .passthrough()

export type ChainMetadata = z.infer<typeof ChainMetadata>

// A list of ChainMetadata. Note - this may contain duplicate configuration settings,
// for example, a custom Ethereum Mainnet configuration and the default Ethereum Mainnet
// configuration.
export type ChainMetadatas = readonly ChainMetadata[]

export type CustomChains = {
  readonly loading: boolean
  readonly result: ChainMetadata[]
  readonly error?: Error
}

export const CAIP_SLICE_NAME = 'caip'

export type UseChainMetadataState = {
  readonly loading: boolean
  readonly result?: ChainMetadatas
  readonly error?: Error
}

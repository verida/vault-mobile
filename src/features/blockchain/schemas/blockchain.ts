import { z } from 'zod'

import { ChainIdSchema } from '~/features/caip'

import { BLOCKCHAIN_NAMESPACES } from '../constants'
import { BaseAssetSchema } from './asset'

const UrlSchema = z.string().url()

export const BlockchainRpcUrlSchema = UrlSchema

export const BlockchainRpcUrlsSchema = z
  .array(BlockchainRpcUrlSchema)
  .nonempty()

export const BlockchainExplorerUrlSchema = UrlSchema

export const BlockchainExplorerSchema = z.object({
  label: z.string().or(z.null()).optional(),
  url: BlockchainExplorerUrlSchema,
  standard: z.string().or(z.null()).optional(),
})

export const BlockchainExplorersSchema = z.array(BlockchainExplorerSchema)

export const BlockchainSchema = z.object({
  chainId: ChainIdSchema,
  label: z.string(),
  logo: UrlSchema.optional(),
  isMainnet: z.boolean(),
  nativeCurrency: BaseAssetSchema,
  confirmations: z.number().int().positive(),
  rpcUrls: BlockchainRpcUrlsSchema,
  blockExplorers: BlockchainExplorersSchema,
})

/**
 * @deprecated use BlockchainSchema instead
 */
export const LegacyBlockchainSchema = z
  .object({
    namespace: z.enum(BLOCKCHAIN_NAMESPACES),
    reference: z.string().nonempty(),
    name: z.string().nonempty(),
    icon: UrlSchema.or(z.null()),
    isMainnet: z.boolean().or(z.null()),
    nativeCurrencyName: z.string().nonempty(),
    symbol: z.string().nonempty(),
    decimals: z.number().positive(),
    rpcUrls: BlockchainRpcUrlsSchema,
    blockExplorers: BlockchainExplorersSchema,
  })
  .passthrough()

// ---- Custom blockchain

// TODO: Try to merge with BaseAssetSchema
const CustomBlockchainNativeCurrencySchema = z.object({
  symbol: z.string(),
  label: z.string(),
  decimals: z.number().int().positive(),
})

export const CustomBlockchainSchema = z.object({
  chainId: ChainIdSchema,
  label: z.string(),
  icon: UrlSchema.or(z.null()),
  isMainnet: z.boolean().or(z.null()),
  nativeCurrency: CustomBlockchainNativeCurrencySchema,
  rpcUrls: BlockchainRpcUrlsSchema,
  blockExplorers: BlockchainExplorersSchema,
})

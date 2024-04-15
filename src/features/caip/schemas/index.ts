import { z } from 'zod'

export const ChainIdSchema = z.object({
  namespace: z.string(),
  reference: z.string(),
})

export const AccountIdSchema = z.object({
  chainId: ChainIdSchema,
  address: z.string(),
})

export const AssetNameSchema = z.object({
  namespace: z.string(),
  reference: z.string(),
})

export const AssetTypeSchema = z.object({
  chainId: ChainIdSchema,
  assetName: AssetNameSchema,
})

export const AssetIdSchema = AssetTypeSchema.extend({
  tokenId: z.string(),
})

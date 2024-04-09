import { z } from 'zod'

import { AssetTypeSchema } from '~/features/caip'

export const BaseAssetSchema = z.object({
  assetType: AssetTypeSchema,
  symbol: z.string(),
  label: z.string(),
  decimals: z.number().int().positive(),
})

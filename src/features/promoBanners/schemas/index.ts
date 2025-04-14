import { z } from 'zod'

export const BannerSchema = z.object({
  id: z.string(),
  order: z.number(),
  image: z.string(),
  buttonLabel: z.string(),
  actionType: z.union([z.literal('screen'), z.literal('link')]),
  actionValue: z.string(),
  params: z.object({}).optional(),
})

export const WalletProviderBannersResponseSchema = z.array(BannerSchema)

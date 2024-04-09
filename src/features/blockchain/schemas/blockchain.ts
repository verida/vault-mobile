import { z } from 'zod'

import { ChainIdSchema } from '~/features/caip'

import { BaseAssetSchema } from './asset'

const BlockchainRpcUrl = z.string().url()

const BlockchainExplorer = z.object({
  url: z.string().url(),
  label: z.string().optional(),
  standard: z.string().optional(),
})

export const Blockchain = z.object({
  chainId: ChainIdSchema,
  label: z.string(),
  logo: z.string().url().optional(),
  isMainnet: z.boolean(),
  nativeCurrency: BaseAssetSchema,
  confirmations: z.number().int().positive(),
  rpcUrls: z.array(BlockchainRpcUrl).nonempty(),
  blockExplorers: z.array(BlockchainExplorer),
})

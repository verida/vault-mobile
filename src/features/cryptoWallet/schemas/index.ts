import { z } from 'zod'

import { VeridaBaseRecordSchema } from '~/features/verida'

export const BaseCryptoWalletSchema = z.object({
  label: z.string(),
  walletType: z.string(),
  mnemonic: z.string().optional(),
  privateKey: z.string().optional(),
  address: z.string().optional(),
})

export const CryptoWalletRecordSchema = VeridaBaseRecordSchema.extend(
  BaseCryptoWalletSchema.shape
).passthrough()

export const CryptoWalletRecordsSchema = CryptoWalletRecordSchema.array()

import { z } from 'zod'

import { VeridaBaseRecordSchema } from '~/features/verida'

export const BaseCryptoWalletRecordSchema = z.object({
  label: z.string(),
  walletType: z.string(),
  mnemonic: z.string().optional(),
  privateKey: z.string().optional(),
  address: z.string().optional(),
})

export const CryptoWalletRecordSchema = VeridaBaseRecordSchema.extend(
  BaseCryptoWalletRecordSchema.shape
).passthrough()

export const CryptoWalletRecordsSchema = CryptoWalletRecordSchema.array()

import { z } from 'zod'

import { VeridaBaseRecordSchema } from '~/features/verida'

import { WALLET_TYPES } from '../constants'

const BaseCryptoWalletRecordSchemaWithoutWalletType = z.object({
  label: z.string(),
  mnemonic: z.string().optional(),
  privateKey: z.string().optional(),
  address: z.string().optional(),
})

// Base record schema used to validate before saving to the database
// We want walletType to be of the new enum
export const BaseCryptoWalletRecordSchema =
  BaseCryptoWalletRecordSchemaWithoutWalletType.extend({
    walletType: z.enum(WALLET_TYPES),
  })

// This schema has a wider walletType definition
const BaseCryptoWalletRecordSchemaWithLegacyWalletType =
  BaseCryptoWalletRecordSchemaWithoutWalletType.extend({
    walletType: z.string(),
  })

// Record schemas used to validate records fetched from the database
// We need the wider walletType definition to be able to read old records
export const CryptoWalletRecordSchema = VeridaBaseRecordSchema.extend(
  BaseCryptoWalletRecordSchemaWithLegacyWalletType.shape
).passthrough()

export const CryptoWalletRecordsSchema = CryptoWalletRecordSchema.array()

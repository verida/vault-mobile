import { VeridaBaseRecordSchema } from 'features/verida'
import { z } from 'zod'

export const DidMetadataSchema = z.object({
  name: z.string().optional(),
  icon: z.string().optional(),
})

export const DidMetadataRecordSchema = VeridaBaseRecordSchema.extend(
  DidMetadataSchema.shape
).passthrough()

import {
  DidMetadataRecordSchema,
  DidMetadataSchema,
} from 'features/did/schemas'
import { z } from 'zod'

export type DidMetadata = z.infer<typeof DidMetadataSchema>

export type DidMetadataRecord = z.infer<typeof DidMetadataRecordSchema>

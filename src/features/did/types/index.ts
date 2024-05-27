import { z } from 'zod'

import {
  DidMetadataRecordSchema,
  DidMetadataSchema,
} from '~/features/did/schemas'

export type DidMetadata = z.infer<typeof DidMetadataSchema>

export type DidMetadataRecord = z.infer<typeof DidMetadataRecordSchema>

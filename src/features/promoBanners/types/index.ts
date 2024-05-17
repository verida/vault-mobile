import { z } from 'zod'

import { BannerSchema } from '../schemas'

export type Banner = z.infer<typeof BannerSchema>

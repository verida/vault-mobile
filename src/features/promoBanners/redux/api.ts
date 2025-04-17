import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import axios from 'axios'
import { REHYDRATE } from 'redux-persist'

import { config } from '~/config'
import { Logger } from '~/features/telemetry'

import { WalletProviderBannersResponseSchema } from '../schemas'
import { Banner } from '../types'

const logger = Logger.create('PromoBanners')

const baseQuery = fetchBaseQuery({
  baseUrl: config.walletProvider.v2Url,
})

export const promoBannersApi = createApi({
  reducerPath: 'promoBannersApi',
  baseQuery: baseQuery,
  refetchOnMountOrArgChange: 60 * 60 * 6, // 6 hours
  refetchOnReconnect: false,
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return action.payload?.[reducerPath]
    }
  },
  endpoints: (build) => ({
    banners: build.query({
      query: (_: Record<string, never> = {}) => {
        logger.debug('Starting query to fetch promo banners...')
        return 'api/v2/promo/banners'
      },
      transformResponse: async (response: unknown): Promise<Banner[]> => {
        const validationResult =
          WalletProviderBannersResponseSchema.safeParse(response)

        if (!validationResult.success) {
          // TODO: Check if zod errors has to be reported differently
          logger.error(new Error(validationResult.error.message))
          return []
        }

        return Promise.all(
          validationResult.data.map(async (banner): Promise<Banner> => {
            return {
              ...banner,

              // We fetch and convert the image to a data URL so it can be cached locally (by redux) and not fetched every time if we keep it as a HTTP URL
              image: await getImageDataUrl(banner.image as string),
            }
          })
        )
      },
      onQueryStarted: () => {
        logger.info('Fetching promo banners...')
      },
    }),
  }),
})

async function getImageDataUrl(imageUrl: string): Promise<string> {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
  const base64 = Buffer.from(response.data, 'binary').toString('base64')
  return `data:${response.headers['content-type']};base64,${base64}`
}

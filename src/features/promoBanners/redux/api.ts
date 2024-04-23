import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
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
  refetchOnMountOrArgChange: 60 * 60 * 1, // 1 hours
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
      transformResponse: (response: unknown): Banner[] => {
        const validationResult =
          WalletProviderBannersResponseSchema.safeParse(response)

        if (!validationResult.success) {
          // TODO: Check if zod errors has to be reported differently
          logger.error(new Error(validationResult.error.message))
          return []
        }

        return validationResult.data
      },
      onQueryStarted: () => {
        logger.info('Fetching promo banners...')
      },
    }),
  }),
})

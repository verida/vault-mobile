import { createSelector } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { config } from 'config'
import { REHYDRATE } from 'redux-persist'

import { LegacyBlockchain } from '../types'

const baseQuery = fetchBaseQuery({
  baseUrl: config.walletProvider.url,
})

export const blockchainApi = createApi({
  reducerPath: 'blockchainApi',
  baseQuery: baseQuery,
  refetchOnMountOrArgChange: 60 * 60 * 12, // 12 hours
  refetchOnReconnect: false,
  // We want to persist/rehydrate this redux api slide
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return action.payload?.[reducerPath]
    }
  },
  endpoints: (build) => ({
    getBlockchainNetworks: build.query({
      // enforced empty object {} as this query params to have a unique cache key
      query: (_: Record<string, never> = {}) => 'chains/list',
      transformResponse: (response: {
        data: Record<'mainnet' | 'testnet', Record<string, LegacyBlockchain>>
      }): Record<string, LegacyBlockchain> => {
        // TODO: Validate with Zod

        const networkEntries = response?.data
          ? { ...response.data.mainnet, ...response.data.testnet }
          : {}

        const allNetworks: Record<string, LegacyBlockchain> = {}
        for (const chainId in networkEntries) {
          const item = <LegacyBlockchain>networkEntries[chainId]
          item.chainId = chainId
          allNetworks[item.chainId] = item
        }

        return allNetworks
      },
    }),
  }),
})

export const { useGetBlockchainNetworksQuery } = blockchainApi

// Selectors
export const getBlockchainNetworks = createSelector(
  blockchainApi.endpoints.getBlockchainNetworks.select({}),
  (data) => data.data || {}
)

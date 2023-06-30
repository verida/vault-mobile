import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { EnvironmentType } from '@verida/types/dist/NetworkInterfaces'
import { REHYDRATE } from 'redux-persist'

import { BlockchainNetwork } from 'api/types'
import CONFIG from 'config/environment'

const baseQuery = fetchBaseQuery({
  baseUrl: CONFIG.WALLET_PROVIDER_URL,
})

export const walletsApi = createApi({
  reducerPath: 'walletsApi',
  baseQuery: baseQuery,
  // We want to persist/rehydrate this redux api slide
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return action.payload?.[reducerPath]
    }
  },
  endpoints: (build) => ({
    chainsList: build.query({
      keepUnusedDataFor: 60 * 60 * 24, // 24 hours
      query: () => `chains/list`,
      transformResponse: (response: {
        data: Record<EnvironmentType, Record<string, BlockchainNetwork>>
      }): Record<string, BlockchainNetwork> => {
        const environmentType: EnvironmentType = CONFIG.WALLET_PROVIDER_CHAINS

        const networkEntries = response.data[environmentType]

        const allNetworks: Record<string, BlockchainNetwork> = {}
        for (const chainId in networkEntries) {
          const item = <BlockchainNetwork>networkEntries[chainId]
          item.chainId = chainId
          allNetworks[item.chainId] = item
        }
        return allNetworks
      },
      // TODO: Handle error
    }),
    // Other wallets Apis
  }),
})

export const { useChainsListQuery } = walletsApi

import { createSelector } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ChainId } from 'caip'
import { config } from 'config'
import { REHYDRATE } from 'redux-persist'

import { RootState } from 'reduxStore/types'

import { BlockchainNetwork } from '../@types'

const baseQuery = fetchBaseQuery({
  baseUrl: config.walletProvider.url,
})

export const blockchainApi = createApi({
  reducerPath: 'blockchainApi',
  baseQuery: baseQuery,
  // We want to persist/rehydrate this redux api slide
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return action.payload?.[reducerPath]
    }
  },
  endpoints: (build) => ({
    getBlockchainNetworks: build.query({
      keepUnusedDataFor: 60 * 60 * 24, // 24 hours
      // enforced empty object {} as this query params to have a unique cache key
      query: (_: Record<string, never> = {}) => 'chains/list',
      transformResponse: (response: {
        data: Record<'mainnet' | 'testnet', Record<string, BlockchainNetwork>>
      }): Record<string, BlockchainNetwork> => {
        // TODO: Validate with Zod

        const networkEntries = response?.data
          ? { ...response.data.mainnet, ...response.data.testnet }
          : {}

        const allNetworks: Record<string, BlockchainNetwork> = {}
        for (const chainId in networkEntries) {
          const item = <BlockchainNetwork>networkEntries[chainId]
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

export const getMaybeBlockchainNetwork = (
  state: RootState,
  chainIdObj: ChainId | null | undefined
): BlockchainNetwork | undefined => {
  if (!chainIdObj) return undefined

  const networks = getBlockchainNetworks(state)

  return networks?.[new ChainId(chainIdObj).toString()]
}

export const getBlockchainNetworkLabel = (
  network: BlockchainNetwork | undefined
) => `${network?.label || 'Unknown Network'}`

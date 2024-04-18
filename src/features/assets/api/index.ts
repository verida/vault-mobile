import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { config } from 'config'

import { NFT } from '../types'

const baseQuery = fetchBaseQuery({
  baseUrl: config.walletProvider.url,
})

export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: baseQuery,
  refetchOnMountOrArgChange: 60 * 10, // 10 min
  // TODO: We could increase the cache expiry and use a forced refetch in UI
  refetchOnReconnect: true,
  endpoints: (build) => ({
    getNFTs: build.query({
      query: (walletAddresses: string[]) =>
        `nfts/list?${walletAddresses
          .map((address) => `wallet[]=${address}`)
          .join('&')}`,
      transformResponse: (response: { data: NFT[] }): NFT[] => {
        // TODO: Validate with Zod

        // TODO: Handle error
        return (
          response?.data.sort((a: any) => (a.metadata?.image ? -1 : 1)) ?? []
        )
      },
    }),
    // Other assets Apis
  }),
})

export const { useGetNFTsQuery } = assetsApi

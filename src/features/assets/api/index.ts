import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { NFT } from 'api/types'
import CONFIG from 'config'

const baseQuery = fetchBaseQuery({
  baseUrl: CONFIG.WALLET_PROVIDER_URL,
})

export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: baseQuery,
  endpoints: (build) => ({
    getNFTs: build.query({
      keepUnusedDataFor: 10 * 60, // 10 mins
      query: (walletAddresses: string[]) =>
        `nfts/list?${walletAddresses
          .map((address) => `wallet[]=${address}`)
          .join('&')}`,
      transformResponse: (response: { data: NFT[] }): NFT[] =>
        response.data.sort((a: any) => (a.metadata?.image ? -1 : 1)),
      // TODO: Handle error
    }),
    // Other assets Apis
  }),
})

export const { useGetNFTsQuery } = assetsApi

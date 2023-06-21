import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { NFT } from 'api/types'
import CONFIG from 'config/environment'

const baseQuery = fetchBaseQuery({
  baseUrl: CONFIG.WALLET_PROVIDER_URL,
})

export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: baseQuery,
  endpoints: (build) => ({
    getWalletNFTCollections: build.query<NFT[], string[]>({
      keepUnusedDataFor: 10 * 60, // 10 mins
      query: (walletAddresses) =>
        `nfts/list?${walletAddresses
          .map((address) => `wallet[]=${address}`)
          .join('&')}`,
      transformResponse: (response: any) =>
        response.data.sort((a: any) => (a.metadata?.image ? -1 : 1)),
    }),
    // Other NFT APIs
  }),
})

export const { useGetWalletNFTCollectionsQuery } = assetsApi

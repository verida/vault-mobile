import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { NFTCollection } from 'api/types'

export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://devnet-walletprovider.tn.verida.tech/',
  }),
  endpoints: (build) => ({
    getWalletNFTCollections: build.query<NFTCollection[], string[]>({
      keepUnusedDataFor: 180, // 3 mins
      query: (walletAddresses) =>
        `nfts/list?${walletAddresses
          .map((address) => `wallet=${address}`)
          .join('&')}`,
      transformResponse: (response: any) =>
        response.data.sort((a: any) => (a.metadata?.image ? -1 : 1)),
    }),
  }),
})

export const { useGetWalletNFTCollectionsQuery } = assetsApi

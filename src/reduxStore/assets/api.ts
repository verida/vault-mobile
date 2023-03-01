import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { NFTCollection } from 'api/types'

export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://devnet-walletprovider.tn.verida.tech/',
  }),
  endpoints: (build) => ({
    getWalletNFTCollections: build.query<NFTCollection[], string[]>({
      query: (_walletAddresses) =>
        'nfts/list?wallet=eip155:5:0xff71512c84096f55cdf5c5f3d3c6ace99b56fef0',
      transformResponse: (response: any) =>
        response.data.sort((a: any) => (a.metadata?.image ? -1 : 1)),
    }),
  }),
})

export const { useGetWalletNFTCollectionsQuery } = assetsApi

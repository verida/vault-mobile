import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { BlockchainNetwork, NFT } from 'api/types'

import CONFIG from '../../config/environment'

export const getWalletNFTCollectionsQuery = createApi({
  reducerPath: 'getWalletNFTCollectionsQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: CONFIG.WALLET_PROVIDER_URL,
  }),
  endpoints: (build) => ({
    getWalletNFTCollections: build.query<NFT[], string[]>({
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

export const { useGetWalletNFTCollectionsQuery } = getWalletNFTCollectionsQuery

/*
export const chainsListQuery = createApi({
  reducerPath: 'chainsListQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: CONFIG.WALLET_PROVIDER_URL,
  }),
  endpoints: (build) => ({
    chainsList: build.query<BlockchainNetwork[], void>({
      keepUnusedDataFor: 60 * 60 * 24, // 24 hours
      query: () => `chains/list`,
      transformResponse: (response: any) =>
        response.data.map(
          (networks: Record<string, any>) =>
            networks[<string>CONFIG.VERIDA_ENVIRONMENT]
        ),
    }),
  }),
})

export const { useChainsListQuery } = chainsListQuery

*/
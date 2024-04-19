import { createSelector } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ChainId } from 'caip'
import { REHYDRATE } from 'redux-persist'

import { config } from '~/config'
import { Logger } from '~/features/telemetry'

import { WalletProviderChainListResponseSchema } from '../schemas'
import { LegacyBlockchain } from '../types'
import { isSupportedCaipNamespace } from '../utils'

const logger = Logger.create('Blockchains')

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
      transformResponse: (rawResponse): Record<string, LegacyBlockchain> => {
        logger.info('Transforming response from getBlockchainNetworks query')
        const blockchains: Record<string, LegacyBlockchain> = {}
        try {
          const response =
            WalletProviderChainListResponseSchema.parse(rawResponse)

          const blockchainEntries = {
            ...response.data.mainnet,
            ...response.data.testnet,
          }

          Object.values(blockchainEntries).forEach((entry) => {
            if (!isSupportedCaipNamespace(entry.namespace)) {
              return
            }

            const chainId = new ChainId({
              namespace: entry.namespace,
              reference: entry.reference,
            }).toString()

            const blockchain: LegacyBlockchain = {
              chainId,
              namespace: entry.namespace,
              reference: entry.reference,
              label: entry.label,
              symbol: entry.symbol,
              explorerURL: entry.explorerURL,
              isMainnet: entry.isMainnet,
              decimal: entry.decimal,
              icon: entry.icon,
              derivationPath: entry.derivationPath,
              rpcUrl: entry.rpcUrl.replace(
                /%INFURA_KEY%/g,
                config.blockchain.infuraApiKey
              ),
            }

            blockchains[chainId] = blockchain
          })

          return blockchains
        } catch (error) {
          logger.error(error)
          return blockchains
        }
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

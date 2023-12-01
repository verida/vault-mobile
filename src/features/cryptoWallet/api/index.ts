import { createSelector } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { EnvironmentType } from '@verida/types/dist/NetworkInterfaces'
import { AssetId, ChainId } from 'caip'
import { config } from 'config'
import { isEmpty } from 'lodash'
import { REHYDRATE } from 'redux-persist'

import { BlockchainNetwork } from 'api/types'
import { RootState } from 'reduxStore/types'

import { BalanceByChain, DetailedTransaction, Transaction } from '../@types'

const baseQuery = fetchBaseQuery({
  baseUrl: config.walletProvider.url,
})

export const cryptoWalletApi = createApi({
  reducerPath: 'cryptoWalletApi',
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
      // enforced empty object {} as this query params to have a unique cache key
      query: (_: Record<string, never> = {}) => 'chains/list',
      transformResponse: (response: {
        data: Record<EnvironmentType, Record<string, BlockchainNetwork>>
      }): Record<string, BlockchainNetwork> => {
        const environmentType: EnvironmentType = config.WALLET_PROVIDER_CHAINS

        const networkEntries = response.data[environmentType]

        const allNetworks: Record<string, BlockchainNetwork> = {}
        for (const chainId in networkEntries) {
          const item = <BlockchainNetwork>networkEntries[chainId]
          item.chainId = chainId
          allNetworks[item.chainId] = item
        }
        return allNetworks
      },
    }),
    getBalances: build.query({
      keepUnusedDataFor: 60 * 15, // 15 mins
      query: (walletAddresses: string[]) =>
        `balance/getBalanceByChains?${walletAddresses
          .map((address) => `wallet=${address}`)
          .join('&')}`,
      transformResponse: (response: {
        data: { results: BalanceByChain }
      }): {
        list: BalanceByChain['results']
        total: number
      } => {
        const balanceByChains = response.data.results

        if (isEmpty(balanceByChains.results)) return { list: [], total: 0 }

        // map prices and balances to recognized coins list and standardize
        const balances = balanceByChains.results
        const total = balanceByChains.totalBalance

        return {
          list: balances.map((tokenBalance) => {
            return {
              ...tokenBalance,
              label: tokenBalance.symbol,
              price: tokenBalance.quote.USD.price,
              change: tokenBalance.quote.USD.percent_change_24h,
              quantity: tokenBalance.balance,
              amount: tokenBalance.amount,
            }
          }),
          total,
        }
      },
    }),
    getTransactionsForToken: build.query({
      query: (body: { userAddress: string; asset: AssetId }) => ({
        url: 'transaction/list',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: Transaction[] }): Transaction[] => {
        const transactions = response.data
        return transactions
      },
    }),
    getTransactionDetails: build.query({
      query: (body: {
        transactionId: string
        userAddress: string
        asset: AssetId
      }) => ({
        url: 'transaction/get',
        method: 'POST',
        body,
      }),
      transformResponse: (response: {
        data: DetailedTransaction
      }): DetailedTransaction => {
        const transaction = response.data
        return transaction
      },
    }),
    // Other wallets Apis
  }),
})

// Query hooks

export const {
  useChainsListQuery,
  useGetBalancesQuery,
  useGetTransactionsForTokenQuery,
  useGetTransactionDetailsQuery,
} = cryptoWalletApi

// Selectors
export const getBlockchainNetworks = createSelector(
  cryptoWalletApi.endpoints.chainsList.select({}),
  (data) => {
    return data.data || {}
  }
)

export const getBlockchainNetwork = (state: RootState, chainIdObj: ChainId) => {
  const networks = getBlockchainNetworks(state)
  const chainId = new ChainId(chainIdObj).toString()

  if (networks?.[chainId]) return networks[chainId]

  throw new Error(`Unknown blockchain network: ${chainId}`)
}

export const getBlockchainNetworkLabel = (network: BlockchainNetwork) => {
  return `${network.label}`
}

export const getBalancesData = (state: RootState, walletAddresses: string[]) =>
  cryptoWalletApi.endpoints.getBalances.select(walletAddresses)(state)
    ?.data ?? {
    list: [],
    total: 0,
  }

export const getTransactionsForTokenData = (
  state: RootState,
  userAddress: string,
  asset: AssetId
) => {
  const transactions =
    cryptoWalletApi.endpoints.getTransactionsForToken.select({
      userAddress,
      asset,
    })(state)?.data ?? []

  return transactions
}

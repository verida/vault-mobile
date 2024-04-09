import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { AssetId, AssetType } from 'caip'
import { REHYDRATE } from 'redux-persist'

import { config } from '~/config'
import { RootState } from '~/reduxStore/types'

import { BalanceByChain, DetailedTransaction, Transaction } from '../types'

const baseQuery = fetchBaseQuery({
  baseUrl: `${config.walletProvider.v2Url}/api`,
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
  keepUnusedDataFor: 60 * 15, // 15 mins
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    getBalances: build.query({
      query: (walletAddresses: string[]) =>
        `v2/balance/getBalanceByChains?${walletAddresses
          .map((address) => `wallet=${address}`)
          .join('&')}`,
      transformResponse: (response: {
        data: BalanceByChain
      }): {
        list: BalanceByChain['results']
        total: number
      } => {
        // TODO: Create a different type for the response from Wallet Provider
        // TODO: Validate with Zod

        const balanceByChains = response?.data

        if (!balanceByChains?.results) {
          return { list: [], total: 0 }
        }

        // map prices and balances to recognized coins list and standardize
        const balances = balanceByChains.results
        const total = balanceByChains.totalBalance ?? 0

        return {
          list: balances.map((tokenBalance) => {
            return {
              ...tokenBalance,
              label: tokenBalance.symbol,
              price: tokenBalance.quote?.USD?.price ?? 0,
              change: tokenBalance.quote?.USD?.percent_change_24h ?? 0,
              balance: tokenBalance.balance ?? 0,
              quantity: tokenBalance.balance ?? 0,
              amount: tokenBalance.amount ?? 0,
            }
          }),
          total,
        }
      },
    }),
  }),
})

const legacyBaseQuery = retry(
  fetchBaseQuery({
    baseUrl: config.walletProvider.url,
  }),
  {
    maxRetries: 2,
  }
)

export const cryptoWalletLegacyApi = createApi({
  reducerPath: 'cryptoWalletLegacyApi',
  baseQuery: legacyBaseQuery,
  // We want to persist/rehydrate this redux api slide
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return action.payload?.[reducerPath]
    }
  },
  keepUnusedDataFor: 60 * 15, // 15 mins
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    // HACK: It is invalid to getTransactionsForToken without specifying a userAddress or asset.
    //       However, the application can technically enter a state where these values are not
    //       defined.
    getTransactionsForToken: build.query({
      query: (body: {
        userAddress: string | null
        asset: AssetType | null
      }) => ({
        url: 'transaction/list',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: Transaction[] }): Transaction[] => {
        return response?.data ?? []
      },
    }),
    getTransactionDetails: build.query({
      query: (body: {
        transactionId: string
        userAddress: string | null | undefined
        asset: AssetType | null | undefined
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

export const { useGetBalancesQuery } = cryptoWalletApi

export const {
  useGetTransactionsForTokenQuery,
  useGetTransactionDetailsQuery,
} = cryptoWalletLegacyApi

// Selectors

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
    cryptoWalletLegacyApi.endpoints.getTransactionsForToken.select({
      userAddress,
      asset,
    })(state)?.data ?? []

  return transactions
}

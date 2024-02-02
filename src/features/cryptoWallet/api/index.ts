import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AssetId } from 'caip'
import { config } from 'config'
import { isEmpty } from 'lodash'
import { REHYDRATE } from 'redux-persist'

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
    // HACK: It is invalid to getTransactionsForToken without specifying a userAddress or asset.
    //       However, the application can technically enter a state where these values are not
    //       defined.
    getTransactionsForToken: build.query({
      query: (body: { userAddress: string | null; asset: AssetId | null }) => ({
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
        userAddress: string | null | undefined
        asset: AssetId | null | undefined
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
  useGetBalancesQuery,
  useGetTransactionsForTokenQuery,
  useGetTransactionDetailsQuery,
} = cryptoWalletApi

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
    cryptoWalletApi.endpoints.getTransactionsForToken.select({
      userAddress,
      asset,
    })(state)?.data ?? []

  return transactions
}

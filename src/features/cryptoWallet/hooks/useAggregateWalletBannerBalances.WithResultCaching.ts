import * as React from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'

import {
  AggregateWalletBannerBalances,
  UseAggregateWalletBannerBalancesParams,
} from '../@types'
import {
  getAggregateWalletBannerBalanceError,
  getAggregateWalletBannerBalanceResult,
  useAggregateWalletBannerBalances,
} from './useAggregateWalletBannerBalances'

// HACK: Loading the wallet banner balances can impact the content
//       what's rendered in the list, for example, balances can
//       temporarily turn to `0` since they are in the loading state
//       and this is a safe fallback for the temporarily invalidated
//       information.
//
//       Here, we ensure that the state is cached whilst unavailable

//       to ensure the interface remains stable.
export function useAggregateWalletBannerBalancesWithResultCaching(
  params: UseAggregateWalletBannerBalancesParams = {}
) {
  const aggregateWalletBannerBalances = useAggregateWalletBannerBalances(params)

  const { loading } = aggregateWalletBannerBalances

  const currentError = getAggregateWalletBannerBalanceError(
    aggregateWalletBannerBalances
  )

  const currentResult = getAggregateWalletBannerBalanceResult(
    aggregateWalletBannerBalances
  )

  const [cachedResult, setCachedResult] =
    React.useState<AggregateWalletBannerBalances>(currentResult)

  useDeepCompareEffect(() => {
    if (loading) return

    setCachedResult(currentResult)
  }, [currentResult, loading])

  return {
    ...aggregateWalletBannerBalances,
    loading,
    result: cachedResult,
    error: currentError,
  }
}

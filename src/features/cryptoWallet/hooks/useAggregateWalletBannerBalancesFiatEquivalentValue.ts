import { ValuedAtWithAccuracy } from '../@types'
import { computeValuationForAggregateWalletBannerBalances } from '../utils'
import {
  getAggregateWalletBannerBalanceResult,
  useAggregateWalletBannerBalances,
} from './useAggregateWalletBannerBalances'

export function useAggregateWalletBannerBalancesValuation(
  result: ReturnType<typeof useAggregateWalletBannerBalances>
): ValuedAtWithAccuracy {
  const aggregateWalletBannerBalances = getAggregateWalletBannerBalanceResult(
    useAggregateWalletBannerBalances()
  )

  const { price, currency, isAccurate } =
    computeValuationForAggregateWalletBannerBalances({
      aggregateWalletBannerBalances,
    })

  return { ...result, price, currency, isAccurate }
}

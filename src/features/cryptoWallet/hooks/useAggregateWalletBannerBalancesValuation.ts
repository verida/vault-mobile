import { AggregateWalletBannerBalances, ValuedAtWithAccuracy } from '../@types'
import { computeValuationForAggregateWalletBannerBalances } from '../utils'

export function useAggregateWalletBannerBalancesValuation({
  aggregateWalletBannerBalances,
}: {
  readonly aggregateWalletBannerBalances: AggregateWalletBannerBalances
}): ValuedAtWithAccuracy {
  const { price, currency, isAccurate } =
    computeValuationForAggregateWalletBannerBalances({
      aggregateWalletBannerBalances,
    })

  return { price, currency, isAccurate }
}

import BigDecimal from 'bignumber.js'

import {
  AggregateWalletBannerBalances,
  Currency,
  ValuedAtWithAccuracy,
} from '../@types'

// TODO: add tests
export function computeValuationForAggregateWalletBannerBalances({
  aggregateWalletBannerBalances,
}: {
  readonly aggregateWalletBannerBalances: AggregateWalletBannerBalances
}): ValuedAtWithAccuracy {
  // First, extract all of the valuations.
  const maybeValuations = aggregateWalletBannerBalances.map((e) => e.valuation)

  // Next, fetch only those which are truthy.
  const valuations = maybeValuations.flatMap((e) => (e ? [e] : []))

  // If there are no valuations to process, we can terminate early.
  // We can determine the accuracy of this early termination if there
  // are no valuations to process, and not just valuations we were
  // unable to process due to missing information.
  if (!valuations.length)
    return {
      currency: Currency.USD,
      price: new BigDecimal(0),
      isAccurate: valuations.length === maybeValuations.length,
    }

  // We can only come up with an accurate calculation if all of the assets
  // have a value.
  const isAccurate = valuations.length === maybeValuations.length

  // TODO: make this return maybe instead of throw
  // Next, we can only perform a calculation if all of the valuations are
  // expressed in the same currency.
  const currencies = [...new Set(valuations.map((e) => e.currency))]

  if (currencies.length !== 1)
    throw new Error(
      'Attempted to perform a valuation using more than one currency.'
    )

  const [currency] = currencies

  const price: BigDecimal = valuations.reduce(
    (r, e) => r.plus(e.price),
    new BigDecimal(0)
  )

  return { currency, price, isAccurate }
}

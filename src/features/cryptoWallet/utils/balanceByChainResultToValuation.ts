import BigDecimal from 'bignumber.js'

import {
  BalanceByChainResult,
  Currency,
  DetailedValuation,
  Interval,
} from '../@types'
import { fixedPointCryptoAsBigDecimal } from './fixedPointCryptoAsBigDecimal'

export function balanceByChainResultToValuation({
  balanceByChainResult,
  decimals,
  balance,
}: {
  readonly balanceByChainResult: BalanceByChainResult
  readonly decimals: number
  readonly balance: `${number}`
}): DetailedValuation {
  const { price: conversionRate, change: maybeChange } = balanceByChainResult

  const price = fixedPointCryptoAsBigDecimal({
    amount: balance,
    decimals,
  }).multipliedBy(conversionRate)

  return {
    // HACK: The Wallet Provider currently only supports USD. In future,
    //       if this can be changed, we'd need to parse the value here.
    currency: Currency.USD,
    price,
    conversionRate: new BigDecimal(conversionRate),
    rates: {
      [Interval.DAILY]: maybeChange || 0,
    },
  }
}

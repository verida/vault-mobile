import BigDecimal from 'bignumber.js'

import { AggregateWalletBannerBalance } from '../@types'

export type AggregateWalletBannerBalanceAsNumericProps = Pick<
  AggregateWalletBannerBalance,
  'balance' | 'decimals'
>

// Returns the token balance of an AggregateWalletBannerBalance as a numeric value.
// For example, of 0.5 ether (500000000000000000) would be returned as '0.5'.
// TODO: rename to tokenBalance or something
export function getAggregateWalletBannerBalanceAsNumeric({
  balance,
  decimals,
}: AggregateWalletBannerBalanceAsNumericProps): number {
  return new BigDecimal(balance)
    .div(new BigDecimal(10).pow(decimals))
    .toNumber()
}

import BigDecimal from 'bignumber.js'

import { AggregateWalletBannerBalance } from '../@types'

// Returns the token balance of an AggregateWalletBannerBalance as a numeric value.
// For example, of 0.5 ether (500000000000000000) would be returned as '0.5'.
export function getAggregateWalletBannerBalanceAsNumeric({
  balance,
  decimals,
}: AggregateWalletBannerBalance): number {
  return new BigDecimal(balance)
    .div(new BigDecimal(10).pow(decimals))
    .toNumber()
}

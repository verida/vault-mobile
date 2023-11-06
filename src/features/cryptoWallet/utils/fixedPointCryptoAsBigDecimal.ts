import BigDecimal from 'bignumber.js'

export type FixedPointCryptoAsBigDecimalProps = {
  readonly amount: string
  readonly decimals: number
}

// Returns the token balance of an AggregateWalletBannerBalance as a numeric value.
// For example, of 0.5 ether (500000000000000000) would be returned as '0.5'.
// TODO: rename to tokenBalance or something
export function fixedPointCryptoAsBigDecimal({
  amount,
  decimals,
}: FixedPointCryptoAsBigDecimalProps): BigDecimal {
  return new BigDecimal(amount).div(new BigDecimal(10).pow(decimals))
}

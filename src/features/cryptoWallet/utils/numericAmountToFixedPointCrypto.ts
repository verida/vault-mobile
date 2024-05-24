import BigDecimal from 'bignumber.js' // TODO: Harmonise use of BigNumber between the libraries
import { BigNumber } from 'ethers'

// Prevent scientific notation, but apparently not gauranteed according to the documentation (https://mikemcl.github.io/bignumber.js/#exponential-at)
BigDecimal.config({ EXPONENTIAL_AT: 1e9 })

export function numericAmountToFixedPointCrypto({
  amount,
  decimals,
}: {
  readonly amount: number /* i.e. 0.01 (ETH) */
  readonly decimals: number /* i.e. 18 (ETH) or 6 (USDC) */
}) {
  const bigDecimalString = BigDecimal(amount.toFixed(decimals))
    .multipliedBy(BigDecimal(10).pow(decimals))
    .toString()

  // BigNumber doesn't like scientific notation, so have to be careful the bigDecimalString isn't one
  const bigNumber = BigNumber.from(bigDecimalString)
  return bigNumber
}

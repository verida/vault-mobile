import BigDecimal from 'bignumber.js'
import { BigNumber } from 'ethers'

export function numericAmountToFixedPointCrypto({
  amount,
  decimals,
}: {
  readonly amount: number /* i.e. 0.01 (ETH) */
  readonly decimals: number /* i.e. 18 (ETH) or 6 (USDC) */
}) {
  return BigNumber.from(
    BigDecimal(amount.toFixed(decimals))
      .multipliedBy(BigDecimal(10).pow(decimals))
      .toString()
  )
}

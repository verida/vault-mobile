import BigDecimal from 'bignumber.js'

export function convertFromCryptoIntegerToDecimal({
  integerCryptoAmount,
  decimals,
}: {
  // e.g. wei
  readonly integerCryptoAmount: string
  readonly decimals: number
}): `${number}` {
  const float = new BigDecimal(integerCryptoAmount).div(
    new BigDecimal(10).pow(decimals)
  )

  return String(float) as `${number}`
}

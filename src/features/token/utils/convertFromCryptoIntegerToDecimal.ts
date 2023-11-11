import BigDecimal from 'bignumber.js'

export function convertFromCryptoIntegerToDecimal({
  integerCryptoAmount,
  decimals,
  decimalPlaces = undefined,
}: {
  // e.g. wei
  readonly integerCryptoAmount: string
  readonly decimals: number
  readonly decimalPlaces?: number
}): `${number}` {
  const float = new BigDecimal(integerCryptoAmount).div(
    new BigDecimal(10).pow(decimals)
  )

  return String(
    parseFloat(
      String(
        typeof decimalPlaces === 'number'
          ? float.decimalPlaces(decimalPlaces)
          : float
      )
    )
  ) as `${number}`
}

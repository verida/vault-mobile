import BigDecimal from 'bignumber.js'
import { DetailedValuation } from 'features/cryptoWallet/@types'

export const convertFromCryptoToFiat = ({
  valueInCrypto,
  valuation: { conversionRate },
  decimalPlaces = undefined,
}: {
  readonly valueInCrypto: `${number}`
  readonly valuation: DetailedValuation
  readonly decimalPlaces?: number
}): `${number}` => {
  const result = new BigDecimal(valueInCrypto).multipliedBy(conversionRate)

  return String(
    (typeof decimalPlaces === 'number'
      ? result.decimalPlaces(decimalPlaces)
      : result
    ).toNumber()
  ) as `${number}`
}

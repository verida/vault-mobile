import BigDecimal from 'bignumber.js'
import { DetailedValuation } from 'features/cryptoWallet/@types'

export const convertFromCryptoToFiat = ({
  valueInCrypto,
  valuation: { conversionRate },
}: {
  readonly valueInCrypto: `${number}`
  readonly valuation: DetailedValuation
}): `${number}` =>
  String(
    new BigDecimal(valueInCrypto).multipliedBy(conversionRate).toNumber()
  ) as `${number}`

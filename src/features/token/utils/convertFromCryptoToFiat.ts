import { DetailedValuation } from 'features/cryptoWallet/@types'

export const convertFromCryptoToFiat = ({
  valueInCrypto,
  valuation: { conversionRate },
}: {
  readonly valueInCrypto: `${number}`
  readonly valuation: DetailedValuation
}): `${number}` =>
  String(parseFloat(valueInCrypto) * conversionRate) as `${number}`

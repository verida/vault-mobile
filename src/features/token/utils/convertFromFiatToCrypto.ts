import { DetailedValuation } from 'features/cryptoWallet/@types'

export const convertFromFiatToCrypto = ({
  valueInFiat,
  valuation: { conversionRate },
}: {
  readonly valueInFiat: `${number}`
  readonly valuation: DetailedValuation
}): `${number}` =>
  String(parseFloat(valueInFiat) / conversionRate) as `${number}`

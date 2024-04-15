import BigDecimal from 'bignumber.js'

import { DetailedValuation } from '~/features/cryptoWallet'

export const convertFromCryptoToFiat = ({
  valueInCrypto,
  valuation: { conversionRate },
}: {
  readonly valueInCrypto: `${number}`
  readonly valuation: DetailedValuation
}): `${number}` => {
  const result = new BigDecimal(valueInCrypto).multipliedBy(conversionRate)
  return String(result.toNumber()) as `${number}`
}

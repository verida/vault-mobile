import BigDecimal from 'bignumber.js'

import { DetailedValuation } from '~/features/cryptoWallet'

export const convertFromFiatToCrypto = ({
  valueInFiat,
  valuation: { conversionRate },
}: {
  readonly valueInFiat: `${number}`
  readonly valuation: DetailedValuation
}): `${number}` =>
  String(
    new BigDecimal(valueInFiat).div(conversionRate).toNumber()
  ) as `${number}`

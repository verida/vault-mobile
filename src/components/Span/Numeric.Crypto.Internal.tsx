import * as React from 'react'
import { Text } from 'react-native'

import { DEFAULT_LOCALE } from '~/constants/locale'

const CRYPTO_NUMBER_FORMAT = new Intl.NumberFormat(DEFAULT_LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
})

/**
 * @deprecated use Numbers instead
 */
export const NumericCryptoInternal = React.memo(function NumericCryptoInternal({
  floatingCryptoAmount,
  symbol,
}: {
  readonly floatingCryptoAmount: `${number}`
  readonly symbol: string
}): JSX.Element {
  return (
    <Text
      children={`${CRYPTO_NUMBER_FORMAT.format(
        Number(floatingCryptoAmount)
      )} ${symbol}`}
    />
  )
})

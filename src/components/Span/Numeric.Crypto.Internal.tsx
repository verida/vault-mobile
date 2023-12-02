import * as React from 'react'
import { Text } from 'react-native'

const CRYPTO_NUMBER_FORMAT = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
})

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

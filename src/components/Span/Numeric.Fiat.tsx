import { Currency } from 'features/cryptoWallet/@types'
import * as React from 'react'
import { StyleProp, Text, ViewStyle } from 'react-native'

export const NumericFiat = React.memo(function NumericFiat({
  style,
  value,
  currency: maybeCurrency,
}: {
  readonly style?: StyleProp<ViewStyle>
  // TODO: make BigDecimal
  readonly value: number
  readonly currency?: Currency | null
}): JSX.Element {
  const { format: priceFormatter } = React.useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: maybeCurrency || Currency.USD,
      }),
    [maybeCurrency]
  )

  return <Text style={style} children={priceFormatter(value)} />
})

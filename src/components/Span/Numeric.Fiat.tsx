import * as React from 'react'
import { StyleProp, Text, TextStyle } from 'react-native'

import { Currency } from '~/features/cryptoWallet'

import { DEFAULT_LOCALE } from 'constants/locale'

export const NumericFiat = React.memo(function NumericFiat({
  style,
  value,
  currency: maybeCurrency,
}: {
  readonly style?: StyleProp<TextStyle>
  // TODO: make BigDecimal
  readonly value: number
  readonly currency?: Currency | null
}): JSX.Element {
  const { format: priceFormatter } = React.useMemo(
    () =>
      new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: 'currency',
        currency: maybeCurrency || Currency.USD,
      }),
    [maybeCurrency]
  )

  return <Text style={style} children={priceFormatter(value)} />
})

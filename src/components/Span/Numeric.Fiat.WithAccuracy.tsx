import BigDecimal from 'bignumber.js'
import { Currency } from 'features/cryptoWallet/@types'
import * as React from 'react'
import { Text } from 'react-native'

import { NumericFiat } from './Numeric.Fiat'

export const NumericFiatWithAccuracy = React.memo(
  function NumericFiatWithAccuracy({
    currency,
    isAccurate,
    value,
  }: {
    readonly currency: Currency
    readonly isAccurate: boolean
    readonly value: BigDecimal
  }): JSX.Element {
    return (
      <Text>
        <NumericFiat value={value.toNumber()} currency={currency} />
        {!isAccurate && '*'}
      </Text>
    )
  }
)

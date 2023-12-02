import { convertFromCryptoIntegerToMaybeDecimalFiat } from 'features/token/utils/convertFromCryptoIntegerToMaybeDecimalFiat'
import * as React from 'react'
import { Text } from 'react-native'

import { NumericFiat } from './Numeric.Fiat'

export const NumericFiatPaymentRequest = React.memo(
  function NumericFiatPaymentRequest({
    ...props
  }: Parameters<
    typeof convertFromCryptoIntegerToMaybeDecimalFiat
  >[0]): JSX.Element {
    const maybeFiatPaymentAmount = convertFromCryptoIntegerToMaybeDecimalFiat({
      ...props,
    })

    if (!maybeFiatPaymentAmount) return <React.Fragment />

    return (
      <Text>
        <Text children='≈ ' />
        <NumericFiat
          value={Number(maybeFiatPaymentAmount.amount)}
          currency={maybeFiatPaymentAmount.units}
        />
      </Text>
    )
  }
)

import React from 'react'
import { View } from 'react-native'

import { Currency } from '~/features/cryptoWallet'

import { NumericFiat } from './Numeric.Fiat'

export default {
  title: 'Numeric.Fiat',
  component: NumericFiat,
  args: {
    value: 100,
    currency: Currency.USD,
  },
  decorators: [
    (Story: React.FC) => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
}

export const OneHundredDollars = {}

export const FortySevenCents = {
  args: {
    value: 0.47,
  },
}

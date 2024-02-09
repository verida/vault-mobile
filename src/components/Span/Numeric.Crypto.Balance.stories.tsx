import React from 'react'
import { View } from 'react-native'

import { NumericCryptoBalance } from './Numeric.Crypto.Balance'

export default {
  title: 'Numeric.Crypto.Balance',
  component: NumericCryptoBalance,
  args: {
    decimals: 18,
    balance: 1 * 10 ** 18,
    symbol: 'ETH',
  },
  decorators: [
    (Story: React.FC) => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
}

export const OneEth = {}

export const HalfAnEth = {
  args: {
    decimals: 18,
    balance: 5 * 10 ** 17,
    symbol: 'ETH',
  },
}

export const DustyStakedEth = {
  args: {
    decimals: 18,
    balance: 123456789 * 10 ** 14,
    symbol: 'lsETH',
  },
}

export const SixtyNineUSDC = {
  args: {
    decimals: 6,
    balance: 69 * 10 ** 6,
    symbol: 'USDC',
  },
}

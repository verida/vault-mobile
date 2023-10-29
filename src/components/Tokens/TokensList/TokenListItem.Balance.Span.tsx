import {
  AggregateWalletBannerBalanceAsNumericProps,
  getAggregateWalletBannerBalanceAsNumeric,
} from 'features/cryptoWallet/utils/getAggregateWalletBannerBalanceAsNumeric'
import * as React from 'react'
import { Text } from 'react-native'

export const TokenListItemBalanceSpan = React.memo(
  function TokenListItemBalanceSpan({
    balance,
    decimals,
    symbol,
  }: AggregateWalletBannerBalanceAsNumericProps & {
    readonly symbol: string
  }): JSX.Element {
    return (
      <Text>
        {getAggregateWalletBannerBalanceAsNumeric({
          balance,
          decimals,
        }).toFixed(3)}{' '}
        {symbol}
      </Text>
    )
  }
)

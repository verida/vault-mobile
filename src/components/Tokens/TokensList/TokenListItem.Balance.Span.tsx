import { AggregateWalletBannerBalance } from 'features/cryptoWallet'
import { fixedPointCryptoAsBigDecimal } from 'features/cryptoWallet/utils/fixedPointCryptoAsBigDecimal'
import * as React from 'react'
import { Text } from 'react-native'

export const TokenListItemBalanceSpan = React.memo(
  function TokenListItemBalanceSpan({
    balance: amount,
    decimals,
    symbol,
  }: Pick<AggregateWalletBannerBalance, 'decimals' | 'balance'> & {
    readonly symbol: string
  }): JSX.Element {
    const n = fixedPointCryptoAsBigDecimal({
      amount,
      decimals,
    })

    const toFixed_4 = n.toFixed(4)

    return (
      <Text>
        {/* HACK: Using toFixed(3) would signal a full integer balance even if it is were less. */}
        {/*       It is more correct to show that the amount has reduced, than to show a full balance. */}
        {toFixed_4.substring(0, toFixed_4.length - 1)} {symbol}
      </Text>
    )
  }
)

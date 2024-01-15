import {
  AggregateWalletBannerBalance,
  fixedPointCryptoAsBigDecimal,
} from 'features/cryptoWallet'
import * as React from 'react'
import { Text } from 'react-native'

import { NumericCryptoInternal } from './Numeric.Crypto.Internal'

export const NumericCryptoBalance = React.memo(function NumericCryptoBalance({
  decimals = 18,
  balance: amount,
  symbol,
}: Pick<
  AggregateWalletBannerBalance,
  'decimals' | 'balance' | 'symbol'
>): JSX.Element {
  return (
    <Text>
      <NumericCryptoInternal
        floatingCryptoAmount={
          String(
            fixedPointCryptoAsBigDecimal({
              amount,
              decimals,
            })
          ) as `${number}`
        }
        symbol={symbol}
      />
    </Text>
  )
})

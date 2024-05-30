import * as React from 'react'
import { Text } from 'react-native'

import { CurrencyFormat } from '~/features/token'
import { useTokenCalculator } from '~/features/token/hooks/useTokenCalculator'

import { NumericCryptoInternal } from './Numeric.Crypto.Internal'
import { NumericFiat } from './Numeric.Fiat'

/**
 * @deprecated use Numbers instead
 */
export const NumericCryptoFiatConversion = React.memo(
  function NumericCryptoFiatConversion({
    getCurrentValueStringAsFiatOrZero,
    getCurrentValueStringAsCryptoOrZero,
    format,
    symbol,
    maybeCurrency,
  }: Pick<
    ReturnType<typeof useTokenCalculator>,
    | 'getCurrentValueStringAsFiatOrZero'
    | 'getCurrentValueStringAsCryptoOrZero'
    | 'format'
    | 'symbol'
    | 'maybeCurrency'
  >): JSX.Element {
    return (
      <Text>
        {'≈ '}
        {format === CurrencyFormat.CRYPTO ? (
          <NumericFiat
            value={Number(getCurrentValueStringAsFiatOrZero())}
            currency={maybeCurrency}
          />
        ) : (
          <NumericCryptoInternal
            floatingCryptoAmount={getCurrentValueStringAsCryptoOrZero()}
            symbol={symbol}
          />
        )}
      </Text>
    )
  }
)

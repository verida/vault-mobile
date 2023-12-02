import BigDecimal from 'bignumber.js'
import { ethers } from 'ethers'
import { ChainMetadata } from 'features/caip'
import {
  AggregateWalletBannerBalance,
  Currency,
  DetailedValuation,
} from 'features/cryptoWallet/@types'
import { fixedPointCryptoAsBigDecimal } from 'features/cryptoWallet/utils/fixedPointCryptoAsBigDecimal'
import {
  convertFromCryptoIntegerToDecimal,
  convertFromCryptoIntegerToMaybeDecimalFiat,
  convertPredictedTransactionFeeToString,
  CurrencyFormat,
  useTokenCalculator,
} from 'features/token'
import * as React from 'react'
import { ActivityIndicator, StyleProp, Text, ViewStyle } from 'react-native'

/**
 * Return the number of decimals (zeros)
 * @param {*} value
 * @param {*} min
 * @param {*} max
 * @param {*} offset
 * @returns
 */
export const getSignificantDigits = (
  value: number, //: number,
  min = 0, //: number,
  max = 6, //: number,
  offset = 2
) => {
  const nbZero = -Math.floor(Math.log10(value) + 1)
  return Math.min(Math.max(nbZero + offset, min), max)
}

const InternalCryptoSpan = React.memo(function LowLevelCryptoSpan({
  floatingCryptoAmount,
  symbol,
}: {
  readonly floatingCryptoAmount: `${number}`
  readonly symbol: string
}): JSX.Element {
  return <Text children={`${floatingCryptoAmount} ${symbol}`} />
})

export const AggregateWalletBannerBalanceSpan = React.memo(
  function AggregateWalletBannerBalanceSpan({
    decimals = 18,
    balance: amount,
    symbol,
  }: Pick<
    AggregateWalletBannerBalance,
    'decimals' | 'balance' | 'symbol'
  >): JSX.Element {
    const n = fixedPointCryptoAsBigDecimal({
      amount,
      decimals,
    })

    return (
      <Text>
        {/* HACK: Using toFixed(3) would signal a full integer balance even if it is were less. */}
        {/*       It is more correct to show that the amount has reduced, than to show a full balance. */}
        <InternalCryptoSpan
          floatingCryptoAmount={String(n) as `${number}`}
          symbol={symbol}
        />
      </Text>
    )
  }
)

// TODO: equivalency prop (search this term)
// TODO: look for coupling with `hasChange`
export const FiatCurrencySpan = React.memo(function PriceFormatterSpan({
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

        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
      }),
    [maybeCurrency]
  )

  return <Text style={style}>{priceFormatter(value)}</Text>
})

export const TokenCalculatorSpan = React.memo(function TokenCalculatorSpan({
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
        <FiatCurrencySpan
          value={Number(getCurrentValueStringAsFiatOrZero())}
          currency={maybeCurrency}
        />
      ) : (
        <InternalCryptoSpan
          floatingCryptoAmount={getCurrentValueStringAsCryptoOrZero()}
          symbol={symbol}
        />
      )}
    </Text>
  )
})

export const FiatCurrencySpanWithAccuracy = React.memo(
  function FiatCurrencySpanWithAccuracy({
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
        <FiatCurrencySpan value={value.toNumber()} currency={currency} />
        {!isAccurate && '*'}
      </Text>
    )
  }
)

// TODO: can convertPredictedTransactionFeeToString be local to this component?
export const PredictedMaxTransactionFeeSpan = React.memo(
  function PredictedMaxTransactionFeeSpan({
    chainMetadata,
    predictedMaxTransactionFee,
    detailedValuation /* when truthy, render in fiat */,
  }: {
    readonly chainMetadata: ChainMetadata
    readonly predictedMaxTransactionFee: ethers.BigNumber
    readonly detailedValuation: DetailedValuation | null | undefined
  }): JSX.Element {
    const maybePredictedTransactionFee = convertPredictedTransactionFeeToString(
      {
        chainMetadata,
        predictedMaxTransactionFee,
      }
    )

    // TODO: use the real loading state from `usePredictMaxTransactionFee`
    if (!maybePredictedTransactionFee) return <ActivityIndicator />

    const { decimals } = chainMetadata

    if (detailedValuation) {
      const maybeFiatTransactionFee =
        convertFromCryptoIntegerToMaybeDecimalFiat({
          integerCryptoAmount: String(predictedMaxTransactionFee),
          valuation: detailedValuation,
          decimals,
        })

      if (maybeFiatTransactionFee) {
        const { amount, units } = maybeFiatTransactionFee
        return <FiatCurrencySpan value={Number(amount)} currency={units} />
      }
    }

    const { amount, units } = maybePredictedTransactionFee

    return (
      <InternalCryptoSpan
        floatingCryptoAmount={convertFromCryptoIntegerToDecimal({
          integerCryptoAmount: amount,
          decimals,
        })}
        symbol={units}
      />
    )
  }
)

export const RequestPaymentValueSpan = React.memo(
  function RequestPaymentValueSpan({
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
        <FiatCurrencySpan
          value={Number(maybeFiatPaymentAmount.amount)}
          currency={maybeFiatPaymentAmount.units}
        />
      </Text>
    )
  }
)

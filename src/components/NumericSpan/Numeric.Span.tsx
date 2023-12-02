import BigDecimal from 'bignumber.js'
import { ethers } from 'ethers'
import { ChainMetadata } from 'features/caip'
import {
  AggregateWalletBannerBalance,
  Currency,
  DetailedValuation,
} from 'features/cryptoWallet/@types'
import { fixedPointCryptoAsBigDecimal } from 'features/cryptoWallet/utils/fixedPointCryptoAsBigDecimal'
// TODO: Needs to be typed props
import {
  convertFromCryptoIntegerToMaybeDecimalFiat,
  convertPredictedTransactionFeeToString,
  CurrencyFormat,
  useTokenCalculator,
} from 'features/token'
import * as React from 'react'
import { ActivityIndicator, StyleProp, Text, ViewStyle } from 'react-native'

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

// TODO: Add CryptoFormatterSpan then commonalize
// TODO: Rename to FiatFormatterSpan
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
  getCurrentValueStringAsCryptoOrZero,
  getCurrentValueStringAsFiatOrZero,
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
        `${getCurrentValueStringAsCryptoOrZero()} ${symbol}`
      )}
    </Text>
  )
})

// TODO: rename because this gets used on PaymentRequestScreen too
export const WalletBannerBalanceSpan = React.memo(
  function WalletBannerBalanceSpan({
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
        {/* TODO: used to be currency symbols */}
        {currency} {value?.toFixed(2) ?? 0}
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

    // TODO: We could use the real loading state.
    if (!maybePredictedTransactionFee) return <ActivityIndicator />

    if (detailedValuation) {
      const { decimals } = chainMetadata

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

    return <Text children={`${amount} ${units}`} />
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
    props?.valuation?.currency

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

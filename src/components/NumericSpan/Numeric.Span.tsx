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
import { StyleProp, Text, ViewStyle } from 'react-native'

// TODO: Support more locales, get the default locale from the device
export const SUPPORTED_LOCALES = ['en-US']
export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0]

export const SUPPORTED_FIAT_CURRENCIES = ['USD']

export const DEFAULT_FIAT_CURRENCY = SUPPORTED_FIAT_CURRENCIES[0]

//const defaultCurrencyFormatterOptions: Intl.NumberFormatOptions = {
//  style: 'currency',
//  currency: DEFAULT_FIAT_CURRENCY,
//  currencyDisplay: 'code',
//}

//function formatFiatCurrency(
//  amount: number,
//  options?: Intl.NumberFormatOptions,
//  locale = DEFAULT_LOCALE
//) {
//  const opts = Object.assign({}, defaultCurrencyFormatterOptions, options)
//  const formatter = new Intl.NumberFormat(locale, opts)
//  return formatter.format(amount)
//}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
}).format

export const NumericSpan = React.memo(function NumericSpan({
  text,
}: {
  readonly text: string
}): JSX.Element {
  return <Text children={`huuuuh ${text}`} />
})

//formattedBalance: `${convertFromCryptoIntegerToDecimal({
//  integerCryptoAmount: String(aggregateWalletBannerBalance.balance),
//  decimals: aggregateWalletBannerBalance.decimals,
//})} ${aggregateWalletBannerBalance.symbol}`,

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

// TODO: equivalency prop (search this term)
// TODO: look for coupling with `hasChange`
export const PriceFormatterSpan = React.memo(function PriceFormattterSpan({
  style,
  value,
}: {
  readonly style?: StyleProp<ViewStyle>
  // TODO: make BigDecimal
  readonly value: number
}): JSX.Element {
  return <Text style={style}>{priceFormatter(value)}</Text>
})

// TODO: equivalency too
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
      {`≈ ${
        format === CurrencyFormat.CRYPTO
          ? // TODO: this used to be currency symbol
            `${maybeCurrency || ''}${getCurrentValueStringAsFiatOrZero()}`
          : `${getCurrentValueStringAsCryptoOrZero()} ${symbol}`
      }`}
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

    // TODO: make this prettier
    if (!maybePredictedTransactionFee) return <Text children='Unknown' />

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
        return <Text children={`${amount} in ${units}`} />
      }
    }

    const { amount, units } = maybePredictedTransactionFee

    return <Text children={`${amount} ${units}`} />
  }
)

// TODO: custom equivalent
export const RequestPaymentValueSpan = React.memo(
  function RequestPaymentValueSpan({
    ...props
  }: Parameters<
    typeof convertFromCryptoIntegerToMaybeDecimalFiat
  >[0]): JSX.Element {
    const maybeFiatPaymentAmount = convertFromCryptoIntegerToMaybeDecimalFiat({
      ...props,
      //...aggregateWalletBannerBalance,
      //integerCryptoAmount: String(amount),
      //valuation: maybeValuation,
    })

    const maybeFormattedFiatValue = maybeFiatPaymentAmount
      ? `${maybeFiatPaymentAmount.units}${maybeFiatPaymentAmount.amount}`
      : undefined

    const formattedFiatValue = maybeFormattedFiatValue

    return (
      <Text
        children={formattedFiatValue ? `≈ ${formattedFiatValue}` : undefined}
      />
    )
  }
)

//export const RequestPaymentValueHeadlineSpan = React.memo(
//  function RequestPaymentValueHeadlineSpan({
//    amount,
//    units,
//  }: AmountWithSymbol): JSX.Element {
//    return <Text>{`${amount} ${units}`}</Text>
//  }
//)

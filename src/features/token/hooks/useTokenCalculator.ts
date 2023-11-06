import BigDecimal from 'bignumber.js'
import { BigNumber } from 'ethers'
import { CURRENCY_SYMBOLS } from 'features/cryptoWallet'
import { AggregateWalletBannerBalance } from 'features/cryptoWallet/@types'
import { fixedPointCryptoAsBigDecimal } from 'features/cryptoWallet/utils'
import * as React from 'react'

import { CurrencyFormat } from '../@types'
import { convertFromCryptoToFiat, convertFromFiatToCrypto } from '../utils'

type State = {
  readonly value: `${number}` | null
  readonly format: CurrencyFormat
}

const unableToConvertError = () =>
  new Error('It is not possible to convert due to missing valuation.')

// Defines common business logic for converting between currencies for a given format.
export function useTokenCalculator({
  aggregateWalletBannerBalance,
  // When auto-filling values, use this value to limit to what
  // amount of numeric representation is desirable without cluttering
  // the text input value.
  prettyNumberOfDecimalPlaces = 4,
  predictedMaxTransactionFee,
}: {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly prettyNumberOfDecimalPlaces?: number
  readonly predictedMaxTransactionFee: BigNumber
}) {
  const { valuation: maybeValuation, symbol } = aggregateWalletBannerBalance

  const [state, setState] = React.useState<State>({
    value: null,
    format: CurrencyFormat.CRYPTO,
  })

  const canConvertBetweenFiatAndCrypto = !!maybeValuation

  const maybeCurrency = maybeValuation?.currency

  const maybeCurrencySymbol: string | null = maybeCurrency
    ? CURRENCY_SYMBOLS[maybeCurrency]
    : null

  // HACK: When using automated values like "max" or toggling between
  //       values, we tend to populate the `TextInput` with very long
  //       numerics given the high-precision integer math of blockchain
  //       platforms. These don't look great on frontend, so when
  //       normalizing, we can optionally specify to render a visually
  //       more appealing string - very small decimals generally do not
  //       interest users.
  const convertIntoPrettyNumber = React.useCallback(
    (value: `${number}`): `${number}` => {
      const toFixedWithExtraDecimalPlaces = Number(value).toFixed(
        // HACK: Use extra precision to avoid rounding issues during truncation.
        prettyNumberOfDecimalPlaces + 5
      )

      return toFixedWithExtraDecimalPlaces
        .substring(0, toFixedWithExtraDecimalPlaces.length - 5)
        .replace(/\.?0*$/, '') as `${number}`
    },
    [prettyNumberOfDecimalPlaces]
  )

  const getNormalizedValue = React.useCallback(
    ({
      valueToNormalize,
    }: {
      readonly valueToNormalize: string | null
    }): `${number}` | null =>
      typeof valueToNormalize !== 'string'
        ? null
        : !valueToNormalize.length
        ? null
        : isNaN(parseFloat(valueToNormalize))
        ? null
        : (valueToNormalize as `${number}`),
    []
  )

  // HACK: Calls toPrettyState will take the `value` inside the state,
  //       and where possible, prettify it. This is useful for when we
  //       populate values of state automatically, which have a tendency
  //       to use especially long decimal places which are unhelpful to
  //       users.
  const toPrettyState = React.useCallback(
    (nextState: State) => {
      const { value: valueToNormalize, ...extras } = nextState

      const normalizedValue = getNormalizedValue({ valueToNormalize })

      if (typeof normalizedValue !== 'string') return nextState

      return {
        ...extras,
        value: convertIntoPrettyNumber(normalizedValue),
      }
    },
    [convertIntoPrettyNumber, getNormalizedValue]
  )

  const getStateAsCrypto = React.useCallback(
    ({ format, value: maybeValue }: State): State => {
      const normalizedValue = getNormalizedValue({
        valueToNormalize: maybeValue,
      })

      if (typeof normalizedValue !== 'string')
        return { format: CurrencyFormat.CRYPTO, value: normalizedValue }

      if (format === CurrencyFormat.CRYPTO)
        return { format, value: normalizedValue }

      if (!maybeValuation)
        throw new Error(
          'Unable to compute conversion from fiat to crypto without a valuation.'
        )

      return {
        format: CurrencyFormat.CRYPTO,
        value: convertFromFiatToCrypto({
          valuation: maybeValuation,
          valueInFiat: normalizedValue,
        }),
      }
    },
    [getNormalizedValue, maybeValuation]
  )

  const getStateAsFiat = React.useCallback(
    ({ format, value: maybeValue }: State): State => {
      const normalizedValue = getNormalizedValue({
        valueToNormalize: maybeValue,
      })

      if (typeof normalizedValue !== 'string')
        return { format: CurrencyFormat.FIAT, value: normalizedValue }

      if (format === CurrencyFormat.FIAT)
        return { format, value: normalizedValue }

      if (!maybeValuation) throw unableToConvertError()

      return {
        format: CurrencyFormat.FIAT,
        value: convertFromCryptoToFiat({
          valuation: maybeValuation,
          valueInCrypto: normalizedValue,
        }),
      }
    },
    [getNormalizedValue, maybeValuation]
  )

  const toggleFormat = React.useCallback(() => {
    const { format } = state

    if (!canConvertBetweenFiatAndCrypto)
      throw new Error('It is not possible to convert due to missing valuation.')

    const nextFormat =
      format === CurrencyFormat.CRYPTO
        ? CurrencyFormat.FIAT
        : CurrencyFormat.CRYPTO

    if (nextFormat === CurrencyFormat.CRYPTO)
      return setState(toPrettyState(getStateAsCrypto(state)))

    if (nextFormat === CurrencyFormat.FIAT)
      return setState(toPrettyState(getStateAsFiat(state)))

    throw new Error(`Encountered unexpercted CurrencyFormat, "${nextFormat}".`)
  }, [
    state,
    canConvertBetweenFiatAndCrypto,
    toPrettyState,
    getStateAsCrypto,
    getStateAsFiat,
  ])

  const onUpdateCalculatedValue = React.useCallback(
    (str: string) =>
      setState((e) => ({
        ...e,
        value: getNormalizedValue({ valueToNormalize: str }),
      })),
    [getNormalizedValue]
  )

  const { decimals, balance: amount } = aggregateWalletBannerBalance

  const maximumCryptoBalance = React.useMemo(
    () =>
      fixedPointCryptoAsBigDecimal({
        decimals,
        amount,
      }),
    [amount, decimals]
  )

  const maxTransactionFee = React.useMemo(
    () =>
      fixedPointCryptoAsBigDecimal({
        decimals,
        amount: String(predictedMaxTransactionFee),
      }),
    [decimals, predictedMaxTransactionFee]
  )

  const maybeMaximumCryptoAmount = React.useMemo(
    () => maximumCryptoBalance.minus(maxTransactionFee),
    [maxTransactionFee, maximumCryptoBalance]
  )

  const maximumCryptoAmount: BigDecimal = React.useMemo(
    () =>
      maybeMaximumCryptoAmount.gt(0)
        ? maybeMaximumCryptoAmount
        : new BigDecimal(0),
    [maybeMaximumCryptoAmount]
  )

  // Create a function which selects the maximum value to send.
  const selectMaxValue = React.useCallback(() => {
    const { format } = state

    if (format === CurrencyFormat.CRYPTO)
      return setState(
        toPrettyState(
          getStateAsCrypto({
            format: CurrencyFormat.CRYPTO,
            value: `${maximumCryptoAmount}` as `${number}`,
          })
        )
      )

    if (!canConvertBetweenFiatAndCrypto) throw unableToConvertError()

    if (format === CurrencyFormat.FIAT)
      return setState(
        toPrettyState(
          getStateAsFiat({
            format: CurrencyFormat.FIAT,
            value: convertFromCryptoToFiat({
              // HACK: We scale the value here because selecting the max value tends
              //       to produce a lot of decimal points which are unnecessary for
              //       frontend.
              valueInCrypto: `${maximumCryptoAmount}` as `${number}`,
              valuation: maybeValuation,
            }),
          })
        )
      )
  }, [
    state,
    toPrettyState,
    getStateAsCrypto,
    maximumCryptoAmount,
    canConvertBetweenFiatAndCrypto,
    getStateAsFiat,
    maybeValuation,
  ])

  const { value: currentCryptoValue } = getStateAsCrypto(state)

  // A "valid" value in this case is one that is truthy (`getStateAsCrypto`) ensures
  // that `currentCryptoValue` has been normalized, and therefore a string will be
  // a valid numeric string and the parsed value of that string is within the operating
  // balance of the asset.
  const isValidValue =
    typeof state.value === 'string' /* has interacted */ &&
    state.value.length > 0 /* has typed */ &&
    typeof currentCryptoValue === 'string' &&
    parseFloat(currentCryptoValue) <=
      maximumCryptoAmount.toNumber() /* has balance */ &&
    parseFloat(currentCryptoValue) > 0 /* is non-zero */

  const getCurrentValueStringAsCryptoOrZero = React.useCallback(
    (): `${number}` => getStateAsCrypto(state).value || '0',
    [getStateAsCrypto, state]
  )

  const getCurrentValueStringAsFiatOrZero = React.useCallback(
    (): `${number}` => getStateAsFiat(state).value || '0',
    [getStateAsFiat, state]
  )

  return {
    ...state,
    toggleFormat,
    canConvertBetweenFiatAndCrypto,
    onUpdateCalculatedValue,
    getNormalizedValue,
    isValidValue,
    symbol,
    selectMaxValue,
    getCurrentValueStringAsCryptoOrZero,
    getCurrentValueStringAsFiatOrZero,
    maybeCurrencySymbol,
  }
}

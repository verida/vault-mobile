import { CURRENCY_SYMBOLS } from 'features/cryptoWallet'
import { AggregateWalletBannerBalance } from 'features/cryptoWallet/@types'
import { getAggregateWalletBannerBalanceAsNumeric } from 'features/cryptoWallet/utils'
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
  // HACK: Using big numbers leads to high-precision decimals which cannot yet
  //       be rendered elegantly on the frontend. Here, we choose to settle on
  //       a maximum length representation we're willing to render.
  maximumNumberOfDecimalPlaces = 8,
}: {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly maximumNumberOfDecimalPlaces?: number
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

  const getNormalizedValue = React.useCallback(
    (forValue: string | null): `${number}` | null => {
      const maybeValue =
        typeof forValue !== 'string'
          ? null
          : !forValue.length
          ? null
          : isNaN(parseFloat(forValue))
          ? null
          : (forValue as `${number}`)
      if (typeof forValue !== 'string') return forValue

      return Number(maybeValue).toFixed(
        maximumNumberOfDecimalPlaces
      ) as `${number}`
    },

    [maximumNumberOfDecimalPlaces]
  )

  const getStateAsCrypto = React.useCallback(
    ({ format, value: maybeValue }: State): State => {
      const normalizedValue = getNormalizedValue(maybeValue)

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
      const normalizedValue = getNormalizedValue(maybeValue)

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
      return setState(getStateAsCrypto(state))

    if (nextFormat === CurrencyFormat.FIAT)
      return setState(getStateAsFiat(state))

    throw new Error(`Encountered unexpercted CurrencyFormat, "${nextFormat}".`)
  }, [state, canConvertBetweenFiatAndCrypto, getStateAsCrypto, getStateAsFiat])

  const onUpdateCalculatedValue = React.useCallback(
    (str: string) =>
      setState((e) => ({ ...e, value: getNormalizedValue(str) })),
    [getNormalizedValue]
  )

  const maximumCryptoAmount = getAggregateWalletBannerBalanceAsNumeric(
    aggregateWalletBannerBalance
  )

  // Create a function which selects the maximum value to send.
  const selectMaxValue = React.useCallback(() => {
    const { format } = state

    if (format === CurrencyFormat.CRYPTO)
      return setState({
        format: CurrencyFormat.CRYPTO,
        value: `${maximumCryptoAmount}` as `${number}`,
      })

    if (format === CurrencyFormat.FIAT) {
      if (!canConvertBetweenFiatAndCrypto) throw unableToConvertError()

      return setState({
        format: CurrencyFormat.FIAT,
        value: convertFromCryptoToFiat({
          valueInCrypto: String(maximumCryptoAmount) as `${number}`,
          valuation: maybeValuation,
        }),
      })
    }
  }, [
    state,
    maximumCryptoAmount,
    canConvertBetweenFiatAndCrypto,
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

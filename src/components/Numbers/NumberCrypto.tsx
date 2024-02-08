import React from 'react'
import { DEFAULT_NUMBER_CRYPTO_FORMAT_OPTIONS } from 'utils'

import { Number, NumberProps } from './Number'

export type NumberCryptoProps = NumberProps

/**
 * Component to format a crypto amount number with the locale and the Intl.NumberFormat API.
 * It can take an optional instance of Intl.NumberFormatOptions with the `options` prop.
 * The default options set the number of decimals.
 *
 * The currency code/symbol is formatted specifically for our needs (e.g. '10 ETH'), so it aligns with the formatting of fiat prices. The currency code must be passed in the unit prop to be displayed.
 *
 * As a recommendation for our UX, prefer the currency code (eg. 'ETH') over the currency symbol, if any to avoid confusion between the currencies as well as to stay consistent with the fiat prices.
 *
 * The underlying component itself is a Typography, allowing to easily set the predefined font styles from the design system.
 */
export const NumberCrypto: React.FunctionComponent<NumberCryptoProps> = (
  props
) => {
  const { options = {}, ...numberProps } = props

  const opts = Object.assign({}, DEFAULT_NUMBER_CRYPTO_FORMAT_OPTIONS, options)

  return <Number {...numberProps} options={opts} />
}

import React from 'react'

import { DEFAULT_NUMBER_FIAT_FORMAT_OPTIONS } from '~/utils'

import { Number, NumberProps } from './Number'

export type NumberFiatProps = NumberProps

/**
 * Component to format a fiat currency price number with the locale and the Intl.NumberFormat API.
 * It can take an optional instance of Intl.NumberFormatOptions with the `options` prop.
 *
 * The default options set the number of decimals.
 *
 * The currency code/symbol is formatted specifically for our needs (e.g. '10 USD' instead of '$10' or 'USD10'), so it aligns with the formatting of crypto amounts. The currency code must be passed in the unit prop to be displayed.
 *
 * As a recommendation for our UX, prefer the currency code (eg. 'USD') over the currency symbol (eg. '$') to avoid confusion between fiat currencies ('USD' and 'AUD' both use '$' as a symbol) as well as to stay consistent with the crypto amount which often lack a symbol.
 *
 * The underlying component itself is a Typography, allowing to easily set the predefined font styles from the design system.
 */
export const NumberFiat: React.FunctionComponent<NumberFiatProps> = (props) => {
  const { options = {}, ...numberProps } = props

  const opts = Object.assign({}, DEFAULT_NUMBER_FIAT_FORMAT_OPTIONS, options)

  return <Number {...numberProps} options={opts} />
}

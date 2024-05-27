import React from 'react'

import { Typography, TypographyProps } from '~/components/Typography'
import { formatNumber } from '~/utils'

export type NumberProps = {
  isLoading?: boolean
  loadingValue?: string
  value: number

  /**
   * Number of decimals to display.
   *
   * Will override the minimumFractionDigits and maximumFractionDigits options.
   */
  nbDecimals?: number
  unit?: string
  options?: Intl.NumberFormatOptions
  locale?: string
} & TypographyProps

/**
 * Component to format a number using the locale and the Intl.NumberFormat API.
 * It can take an optional instance of Intl.NumberFormatOptions with the `options` prop.
 *
 * The underlying component itself is a Typography, allowing to easily set the predefined font styles from the design system.
 */
export const Number: React.FunctionComponent<NumberProps> = (props) => {
  const {
    isLoading = false,
    loadingValue = '-',
    value,
    unit,
    nbDecimals,
    options = {},
    locale,
    ...typographyProps
  } = props

  const opts = Object.assign(
    {},
    options,
    nbDecimals
      ? {
          minimumFractionDigits: nbDecimals,
          maximumFractionDigits: nbDecimals,
        }
      : {}
  )

  const formatedValue = isLoading
    ? loadingValue
    : formatNumber(value, unit, opts, locale)

  return <Typography {...typographyProps}>{formatedValue}</Typography>
}

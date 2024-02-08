import React from 'react'
import { DEFAULT_PERCENTAGE_FORMAT_OPTIONS } from 'utils'

import { Number, NumberProps } from './Number'

export type NumberPercentProps = Omit<NumberProps, 'unit'>

/**
 * Component to format a number in percentage using the locale and the Intl.NumberFormat API.
 * It can take an optional instance of Intl.NumberFormatOptions with the `options` prop.
 *
 * The underlying component itself is a Typography, allowing to easily set the predefined font styles from the design system.
 */
export const NumberPercent: React.FunctionComponent<NumberPercentProps> = (
  props
) => {
  const { options = {}, ...numberProps } = props

  const opts = Object.assign({}, DEFAULT_PERCENTAGE_FORMAT_OPTIONS, options)

  return <Number {...numberProps} unit={undefined} options={opts} />
}

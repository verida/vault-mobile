import React from 'react'
import { formatNumber } from 'utils'

import { Typography, TypographyProps } from 'components/Typography'

export type NumberProps = {
  value: number
  unit?: string
  options?: Intl.NumberFormatOptions
  locale?: string
} & TypographyProps

export const Number: React.FunctionComponent<NumberProps> = (props) => {
  const { value, unit, options, locale, ...typographyProps } = props

  const formatedValue = formatNumber(value, unit, options, locale)

  return <Typography {...typographyProps}>{formatedValue}</Typography>
}

import React from 'react'
import { formatNumberPercentage } from 'utils'

import { Typography, TypographyProps } from 'components/Typography'

export type NumberPercentProps = {
  value: number
  options?: Intl.NumberFormatOptions
  locale?: string
} & TypographyProps

export const NumberPercent: React.FunctionComponent<NumberPercentProps> = (
  props
) => {
  const { value, options, locale, ...typographyProps } = props

  const formatedValue = formatNumberPercentage(value, options, locale)

  return <Typography {...typographyProps}>{formatedValue}</Typography>
}

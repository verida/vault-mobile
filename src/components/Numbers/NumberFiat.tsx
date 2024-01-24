import React from 'react'

import { Number, NumberProps } from './Number'

export type NumberFiatProps = NumberProps

const defaultFiatOptions: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

export const NumberFiat: React.FunctionComponent<NumberFiatProps> = (props) => {
  const { options = {}, ...numberProps } = props

  const opts = Object.assign({}, defaultFiatOptions, options)

  return <Number {...numberProps} options={opts} />
}

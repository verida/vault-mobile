import React from 'react'

import { Number, NumberProps } from './Number'

export type NumberCryptoProps = {
  nbDecimals?: number
} & NumberProps

const defaultCryptoOptions: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
}

export const NumberCrypto: React.FunctionComponent<NumberCryptoProps> = (
  props
) => {
  const { nbDecimals, options = {}, ...numberProps } = props

  const opts = Object.assign(
    {},
    defaultCryptoOptions,
    nbDecimals
      ? {
          minimumFractionDigits: nbDecimals,
          maximumFractionDigits: nbDecimals,
        }
      : {},
    options
  )

  return <Number {...numberProps} options={opts} />
}

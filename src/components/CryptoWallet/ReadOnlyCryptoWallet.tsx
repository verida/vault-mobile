import React, { ComponentProps } from 'react'

import { Icon } from '~/components/Icon'

export type ReadOnlyCryptoWalletProps = Omit<
  ComponentProps<typeof Icon>,
  'name'
>

export const ReadOnlyCryptoWallet: React.FunctionComponent<
  ReadOnlyCryptoWalletProps
> = (props) => {
  const { size = 20, color } = props

  return <Icon name='eye' size={size} color={color} />
}

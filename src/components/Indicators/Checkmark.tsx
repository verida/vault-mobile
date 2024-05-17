import { useTheme } from 'contexts'
import React, { ComponentProps } from 'react'

import { Icon } from '~/components/Icon'

export type CheckmarkProps = Omit<ComponentProps<typeof Icon>, 'name'>

export const Checkmark: React.FunctionComponent<CheckmarkProps> = (props) => {
  const { size = 20, color } = props

  const { theme } = useTheme()

  return (
    <Icon
      name='check-circle'
      size={size}
      color={color || theme.color.success}
    />
  )
}

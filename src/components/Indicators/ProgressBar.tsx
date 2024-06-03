import React, { ComponentProps } from 'react'
import * as Progress from 'react-native-progress'

import { useTheme } from '~/contexts'

export type ProgressBarProps = ComponentProps<typeof Progress.Bar>

export const ProgressBar: React.FunctionComponent<ProgressBarProps> = (
  props
) => {
  const {
    width = null,
    color,
    unfilledColor,
    borderColor,
    borderWidth,
    ...otherProps
  } = props

  const { theme } = useTheme()

  return (
    <Progress.Bar
      {...otherProps}
      width={width}
      color={color || theme.color.primary}
      unfilledColor={unfilledColor || theme.color.lightGrey}
      borderColor={borderColor || theme.color.lightGrey}
      borderWidth={borderWidth || 0}
    />
  )
}

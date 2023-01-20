import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { View, ViewProps, ViewStyle } from 'react-native'

import { Theme } from 'styles/types'

export type SpacerProps = Pick<
  ViewStyle,
  'flex' | 'width' | 'height' | 'minWidth' | 'minHeight' | 'backgroundColor'
> &
  Pick<ViewProps, 'pointerEvents'> & {
    vertical?: keyof Theme['spacing']
    horizontal?: keyof Theme['spacing']
  }

export function Spacer(props: SpacerProps) {
  const { vertical, horizontal, pointerEvents = 'none', ...style } = props
  const { theme } = useTheme()
  return (
    <View
      style={[
        horizontal ? { width: theme.spacing[horizontal] } : {},
        vertical ? { height: theme.spacing[vertical] } : {},
        style,
      ]}
      pointerEvents={pointerEvents}
    />
  )
}

import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { View, ViewProps } from 'react-native'

interface LineProps extends ViewProps {
  vertical?: boolean
  size?: number
  color?: string
}

export function Line(props: LineProps) {
  const { theme } = useTheme()
  const {
    vertical,
    size = 1,
    color = theme.color.separatorExtraLight,
    style,
    ...rest
  } = props
  return (
    <View
      style={[
        { backgroundColor: color },
        vertical
          ? { height: '100%', width: size }
          : { width: '100%', height: size },
        style,
      ]}
      pointerEvents='none'
      {...rest}
    />
  )
}

Line.defaultProps = {
  vertical: false,
} as LineProps

import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { StyleProp, Text as NativeText, TextStyle } from 'react-native'

import text from 'styles/text'

type TextProps = React.ComponentProps<typeof NativeText> & {
  style?: StyleProp<TextStyle>
}

export const Caption = (props: TextProps) => {
  const { style, ...rest } = props
  const { theme } = useTheme()
  const styleWithTheme: StyleProp<TextStyle> = {
    color: theme.color.onPrimary,
    textAlign: 'left',
  }

  return <NativeText {...rest} style={[styleWithTheme, style]} />
}

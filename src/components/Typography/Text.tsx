import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { StyleProp, Text as NativeText, TextStyle } from 'react-native'

import { NUNITO_SANS } from 'constants/text'

type TextProps = React.ComponentProps<typeof NativeText> & {
  style?: StyleProp<TextStyle>
}

export const Text = (props: TextProps) => {
  const { style, ...rest } = props
  const { theme } = useTheme()
  const styleWithTheme: StyleProp<TextStyle> = {
    color: theme.color.onBackground,
    fontFamily: NUNITO_SANS,
    textAlignVertical: 'center',
    fontSize: theme.fontSize.m,
    textAlign: 'left',
  }

  return <NativeText {...rest} style={[styleWithTheme, style]} />
}

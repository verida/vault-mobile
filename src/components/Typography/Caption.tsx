import React from 'react'
import {
  StyleProp,
  StyleSheet,
  Text as NativeText,
  TextStyle,
} from 'react-native'

import Text from 'components/Text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import text from 'styles/text'
import { Theme } from 'styles/types'

type CaptionProps = React.ComponentProps<typeof NativeText> & {
  style?: StyleProp<TextStyle>
}

export const Caption = (props: CaptionProps) => {
  const styles = useThemeAwareStyle(createStyles)
  return <Text {...props} style={[styles.text, props.style]} />
}

const createStyles = (theme: Theme) => {
  const styles = StyleSheet.create({
    text: {
      ...text.primary,
      color: theme.color.onBackground,
      fontSize: theme.fontSize.l,
      textAlign: 'left',
    },
  })
  return styles
}

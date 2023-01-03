import React from 'react'
import { StyleProp, StyleSheet, TextStyle } from 'react-native'

import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import text from 'styles/text'
import { Theme } from 'styles/types'

import { Text } from './Text'

type Props = React.ComponentProps<typeof Text> & {
  style?: StyleProp<TextStyle>
  children: React.ReactNode
}

export const Headline = (props: Props) => {
  const styles = useThemeAwareStyle(createStyles)
  return <Text {...props} style={[styles.text, props.style]} />
}

const createStyles = (theme: Theme) => {
  const styles = StyleSheet.create({
    text: {
      ...text.primary,
      color: theme.color.onPrimary,
      fontSize: theme.fontSize.xxl,
      textAlign: 'left',
    },
  })
  return styles
}

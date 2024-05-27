import React from 'react'
import { StyleSheet, TextProps } from 'react-native'

import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { Theme } from '~/styles/types'

import { Text } from './Text'

type Props = TextProps & {
  children: React.ReactNode
}

/**
 * @deprecated Use Typography instead
 */
export const Paragraph = (props: Props) => {
  const styles = useThemeAwareStyle(createStyles)
  return <Text {...props} style={[styles.text, props.style]} />
}

const createStyles = (theme: Theme) => {
  const styles = StyleSheet.create({
    text: {
      fontSize: theme.fontSize.l,
      color: theme.color.onBackground,
    },
  })
  return styles
}

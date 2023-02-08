import * as React from 'react'
import { StyleSheet } from 'react-native'

import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import text from 'styles/text'
import { Theme } from 'styles/types'

import { Text } from './Text'

type Props = React.ComponentProps<typeof Text> & {
  children: React.ReactNode
}

export const Title = (props: Props) => {
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

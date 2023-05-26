import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

type AlertProps = {
  type?: 'info' | 'success' | 'warning' | 'error'
  children: React.ReactNode
} & React.ComponentProps<typeof View>

export const Alert: React.FunctionComponent<AlertProps> = (props) => {
  const { type, children, ...rest } = props

  const styles = useThemeAwareStyle(createStyles)

  const typeStype = type ? styles[type] : styles.info

  // TODO: Add the type icon

  return (
    <View {...rest}>
      <View style={[styles.container, typeStype]}>{children}</View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      backgroundColor: theme.color.snow,
      borderRadius: theme.roundness.xs,
      borderLeftWidth: 4,
    },
    info: {
      borderLeftColor: theme.color.primary, // TODO: Define a colour for info
    },
    success: {
      borderLeftColor: theme.color.success,
    },
    warning: {
      borderLeftColor: theme.color.warning,
    },
    error: {
      borderLeftColor: theme.color.error,
    },
  })

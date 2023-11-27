import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

export type AlertProps = {
  type?: AlertType
  children: React.ReactNode | string
} & React.ComponentProps<typeof View>

export const Alert: React.FunctionComponent<AlertProps> = (props) => {
  const { type, children, ...rest } = props

  const styles = useThemeAwareStyle(createStyles)

  const typeStype = type ? styles[type] : styles.info

  // TODO: Add the type icon

  return (
    <View {...rest}>
      <View style={[styles.container, typeStype]}>
        {typeof children === 'string' ? (
          <Text style={styles.text} numberOfLines={3} ellipsizeMode='tail'>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
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
    text: {
      fontSize: theme.fontSize.m,
      color: theme.color.black,
      lineHeight: 20,
      fontFamily: NUNITO_SANS_SEMIBOLD,
    },
  })

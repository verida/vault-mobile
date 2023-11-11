import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'

import { Theme } from 'styles/types'

export type RequestMessageProps = {
  children: React.ReactNode
} & ViewProps

export const RequestMessage: React.FunctionComponent<RequestMessageProps> = (
  props
) => {
  const { children, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <View style={styles.message}>
        <Text>{`"${String(children)}"`}</Text>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    message: {
      padding: theme.spacing.m,
      backgroundColor: '#F5F4FF', // TODO: Add to theme
      borderRadius: theme.roundness.xs,
    },
  })

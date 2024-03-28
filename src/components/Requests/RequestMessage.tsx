import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { Typography } from '~/components'
import { Theme } from '~/styles/types'

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
        <Typography>{`"${String(children)}"`}</Typography>
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

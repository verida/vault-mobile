import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { Alert, AlertType } from 'components/Alert'
import Button from 'components/Button'
import { Theme } from 'styles/types'

type Action = {
  label: React.ReactNode
  onPress: () => void
  disabled?: boolean
  color?: string // TODO: Use type from Button once it's properly reworked
}

export type BottomActionBarProps = {
  actions: Action[]
  alertType?: AlertType
  alertContent?: React.ReactNode | string
} & ViewProps

export const BottomActionBar: React.FunctionComponent<BottomActionBarProps> = (
  props
) => {
  const { actions, alertContent, alertType, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        {alertContent ? (
          <Alert type={alertType} style={styles.alertContainer}>
            {alertContent}
          </Alert>
        ) : null}
        <View style={styles.actionsContainer}>
          {/* TODO: Ensure the buttons have a background */}
          {actions.map((action) => (
            <Button
              key={action.label}
              onPress={action.onPress}
              disabled={action.disabled}
              color={action.color}
              style={styles.actionButton}>
              {action.label}
            </Button>
          ))}
        </View>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.color.background,
      paddingVertical: theme.spacing.sm,
      borderTopColor: theme.color.lightGrey,
      borderTopWidth: 1,
    },
    actionsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.s, // Trick as React Native 0.68 doesn't support gap
    },
    actionButton: {
      flex: 1,
      marginBottom: 0,
      marginHorizontal: theme.spacing.s,
    },
    alertContainer: {
      marginBottom: theme.spacing.sm,
      marginHorizontal: theme.spacing.m,
    },
    alertText: {
      flexDirection: 'row',
    },
  })

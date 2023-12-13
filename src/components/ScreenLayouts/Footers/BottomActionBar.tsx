import { useTheme } from 'contexts'
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
  actions?: Action[]
  alertType?: AlertType
  alertContent?: React.ReactNode | string
  hideBorder?: boolean
} & ViewProps

export const BottomActionBar: React.FunctionComponent<BottomActionBarProps> = (
  props
) => {
  const {
    actions,
    alertContent,
    alertType,
    hideBorder = false,
    ...viewProps
  } = props

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  return (
    <View {...viewProps}>
      <View
        style={[
          styles.container,
          !hideBorder && styles.containerWithTopBorder,
        ]}>
        {alertContent ? (
          <Alert
            type={alertType}
            style={[
              styles.alertContainer,
              actions && actions.length > 0
                ? {
                    marginBottom: theme.spacing.sm,
                  }
                : {},
            ]}>
            {alertContent}
          </Alert>
        ) : null}
        {actions && actions.length > 0 ? (
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
        ) : null}
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.color.background,
      paddingVertical: theme.spacing.sm,
    },
    containerWithTopBorder: {
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
      marginHorizontal: theme.spacing.m,
    },
    alertText: {
      flexDirection: 'row',
    },
  })

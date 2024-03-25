import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { Alert, AlertType } from '~/components/Alert'
import Button from '~/components/Button'
import { IconName } from '~/components/Icon'
import { useTheme } from '~/contexts'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

type Action = {
  label: React.ReactNode
  onPress: () => void
  disabled?: boolean
  color?: string // TODO: Use type from Button once it's properly reworked
}

export type BottomActionBarProps = {
  actions?: Action[]
  actionsOrientation?: 'row' | 'column'
  alertType?: AlertType
  alertContent?: React.ReactNode | string
  alertOnPress?: () => void
  alertActionIcon?: IconName
  hideBorder?: boolean
} & ViewProps

export const BottomActionBar: React.FunctionComponent<BottomActionBarProps> = (
  props
) => {
  const {
    actions,
    actionsOrientation = 'row',
    alertType,
    alertContent,
    alertOnPress,
    alertActionIcon,
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
            onPress={alertOnPress}
            actionIcon={alertActionIcon}
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
          <View
            style={[
              styles.actionsContainer,
              { flexDirection: actionsOrientation },
            ]}>
            {/* TODO: Ensure the buttons have a background */}
            {actions.map((action, index) => (
              <Button
                key={action.label}
                onPress={action.onPress}
                disabled={action.disabled}
                color={action.color}
                style={[
                  styles.actionButton,
                  {
                    flex: actionsOrientation === 'row' ? 1 : undefined,
                    marginTop:
                      actionsOrientation === 'column' && index !== 0
                        ? theme.spacing.s
                        : 0,
                  },
                ]}>
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
      paddingHorizontal: theme.spacing.s, // Trick as React Native 0.68 doesn't support gap
      // TODO: change spacing after upgrading to a React native supporting gap in flex
    },
    actionButton: {
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

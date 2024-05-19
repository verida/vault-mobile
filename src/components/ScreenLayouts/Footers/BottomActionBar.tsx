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
            actionIcon={alertActionIcon}>
            {alertContent}
          </Alert>
        ) : null}
        {actions && actions.length > 0 ? (
          <View
            style={{
              flexDirection: actionsOrientation,
              gap:
                actionsOrientation === 'row'
                  ? theme.spacing.m
                  : theme.spacing.s,
            }}>
            {actions.map((action) => (
              <Button
                key={action.label}
                onPress={action.onPress}
                disabled={action.disabled}
                color={action.color}
                style={[
                  styles.actionButton,
                  {
                    flex: actionsOrientation === 'row' ? 1 : undefined,
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
      paddingHorizontal: theme.spacing.m,
      gap: theme.spacing.sm,
    },
    containerWithTopBorder: {
      borderTopColor: theme.color.lightGrey,
      borderTopWidth: 1,
    },
    actionButton: {
      marginBottom: 0, // Override the annoying default style of <Button>
    },
    alertText: {
      flexDirection: 'row',
    },
  })

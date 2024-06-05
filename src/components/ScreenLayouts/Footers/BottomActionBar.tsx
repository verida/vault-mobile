import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { Alert, AlertType } from '~/components/Alert'
import { Button, ButtonProps } from '~/components/Buttons'
import { IconName } from '~/components/Icon'
import { useTheme } from '~/contexts'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

type Action = {
  label?: string // Used as shortcut to children
} & ButtonProps

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
            {actions.map(
              ({ label, style, children, ...buttonProps }, index) => (
                <Button
                  key={index}
                  {...buttonProps}
                  style={[
                    style,
                    {
                      flex: actionsOrientation === 'row' ? 1 : undefined,
                    },
                  ]}>
                  {label || children}
                </Button>
              )
            )}
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
    alertText: {
      flexDirection: 'row',
    },
  })

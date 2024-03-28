import React, { ComponentProps } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { Icon, IconName, Typography } from '~/components'
import { useTheme } from '~/contexts'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

export type AlertProps = {
  type?: AlertType
  actionIcon?: IconName
  children: React.ReactNode | string
} & React.ComponentProps<typeof View> &
  Pick<ComponentProps<typeof TouchableOpacity>, 'onPress'>

export const Alert: React.FunctionComponent<AlertProps> = (props) => {
  const {
    type,
    children,
    onPress,
    actionIcon = 'chevron-forward',
    ...viewProps
  } = props

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  const typeIcon: IconName | undefined =
    type === 'error'
      ? 'error-circle'
      : type === 'warning'
        ? 'exclamation-circle'
        : type === 'success'
          ? 'check-circle'
          : 'info-circle'

  const typeColor =
    type === 'error'
      ? theme.color.error
      : type === 'warning'
        ? theme.color.warning
        : type === 'success'
          ? theme.color.success
          : theme.color.primary // TODO: Define a proper color for info

  // TODO: Add the type icon

  return (
    <View {...viewProps}>
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <View style={[styles.container, { borderLeftColor: typeColor }]}>
          {typeIcon ? (
            <Icon name={typeIcon} size={16} color={typeColor} />
          ) : null}
          <View style={styles.contentContainer}>
            {typeof children === 'string' ? (
              <Typography
                variant='bodySemiBold'
                numberOfLines={3}
                ellipsizeMode='tail'>
                {children}
              </Typography>
            ) : (
              children
            )}
          </View>
          {onPress ? <Icon name={actionIcon} size={24} /> : null}
        </View>
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.color.snow,
      borderRadius: theme.roundness.xs,
      borderLeftWidth: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
    contentContainer: {
      flex: 1,
    },
  })

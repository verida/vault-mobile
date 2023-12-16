import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'

import { Theme } from 'styles/types'

export type DrawerShortcutButtonProps = {
  icon: React.ReactNode
  label: string
} & TouchableOpacityProps

export const DrawerShortcutButton: React.FunctionComponent<DrawerShortcutButtonProps> =
  (props) => {
    const {
      icon,
      label,
      onPress,
      activeOpacity = 0.4,
      ...touchableProps
    } = props

    const styles = useThemeAwareStyle(createStyles)

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        {...touchableProps}>
        <View style={styles.container}>
          {icon}
          <Text style={styles.label} numberOfLines={1} ellipsizeMode='tail'>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      marginLeft: theme.spacing.m,
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.m,
      lineHeight: theme.fontSize.m * 1.5,
    },
  })

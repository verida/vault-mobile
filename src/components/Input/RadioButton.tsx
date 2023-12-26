import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { Theme } from 'styles/types'

export type RadioButtonProps = {
  checked?: boolean
  label: string
  onToggle: () => void
} & ViewProps

export const RadioButton: React.FunctionComponent<RadioButtonProps> = (
  props
) => {
  const { checked, label, onToggle, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={onToggle}
        disabled={!onToggle}
        hitSlop={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <Text style={styles.label}>{label}</Text>
        {checked ? (
          <Icon name='circle-slice-8' size={24} style={styles.iconChecked} />
        ) : (
          <Icon name='circle-outline' size={24} style={styles.iconUnchecked} />
        )}
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.m,
      lineHeight: 21,
      textTransform: 'capitalize',
    },
    iconChecked: {
      color: theme.color.success,
    },
    iconUnchecked: {
      color: theme.color.lightGrey,
    },
  })

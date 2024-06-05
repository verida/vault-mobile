import React from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'

import { Icon, Typography } from '~/components'
import { useTheme } from '~/contexts'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

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
  const { theme } = useTheme()

  return (
    <View {...viewProps}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={onToggle}
        disabled={!onToggle}
        hitSlop={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <Typography variant='bodySemiBold' style={styles.label}>
          {label}
        </Typography>
        {checked ? (
          <Icon
            name='radio-button-checked'
            size={24}
            color={theme.color.success}
          />
        ) : (
          <Icon
            name='radio-button-unchecked'
            size={24}
            color={theme.color.lightGrey}
          />
        )}
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      textTransform: 'capitalize',
    },
  })

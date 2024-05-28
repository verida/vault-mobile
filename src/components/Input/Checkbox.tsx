import React from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'

import { Icon } from '~/components'
import { Typography } from '~/components/Typography'
import { HIT_SLOP_10_10 } from '~/constants'
import { useTheme } from '~/contexts'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type CheckboxProps = {
  checked?: boolean
  onToggle: () => void
} & ViewProps

export const Checkbox: React.FC<CheckboxProps> = (props) => {
  const { checked, children, onToggle, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  return (
    <View {...viewProps}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={onToggle}
        disabled={!onToggle}
        hitSlop={HIT_SLOP_10_10}>
        {checked ? (
          <Icon name='checkbox-checked' size={24} color={theme.color.success} />
        ) : (
          <Icon
            name='checkbox-unchecked'
            size={24}
            color={theme.color.lightGrey}
          />
        )}
        {typeof children === 'string' ? (
          <Typography variant='body'>{children}</Typography>
        ) : (
          children
        )}
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
  })

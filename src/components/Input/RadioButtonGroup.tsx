import { useThemeAwareStyle } from 'hooks'
import React, { useCallback } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { RadioButton } from 'components/Input/RadioButton'
import { Theme } from 'styles/types'

export type RadioButtonItem = {
  value: string
  label: string
}

export type RadioButtonGroupProps = {
  items: RadioButtonItem[]
  selectedItem?: string
  onValueChange?: (value: string) => void
} & ViewProps

export const RadioButtonGroup: React.FunctionComponent<
  RadioButtonGroupProps
> = (props) => {
  const { items, onValueChange, selectedItem, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  const handleItemToggle = useCallback(
    (value: string) => {
      if (value === selectedItem) {
        return
      }
      if (onValueChange) {
        onValueChange(value)
      }
    },
    [onValueChange, selectedItem]
  )

  return (
    <View {...viewProps}>
      <View>
        {items.map((item, index) => (
          <RadioButton
            key={item.value}
            label={item.label}
            onToggle={() => handleItemToggle(item.value)}
            checked={item.value === selectedItem}
            style={index === 0 ? undefined : styles.item}
          />
        ))}
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    item: {
      marginTop: theme.spacing.m,
    },
  })

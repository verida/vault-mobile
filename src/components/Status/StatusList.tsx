import { useTheme } from 'contexts'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { AnimatedCheckbox } from 'components/Input'
import { Theme } from 'styles/types'

export type StatusListItem = {
  status: 'idle' | 'success' | 'error' | 'processing'
  label: string
}

export type StatusListProps = {
  statusItems: StatusListItem[]
} & ViewProps

export const StatusList: React.FunctionComponent<StatusListProps> = (props) => {
  const { statusItems, ...viewProps } = props

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        {statusItems.map((item, index) => (
          <AnimatedCheckbox
            key={item.label}
            checked={item.status === 'success'}
            failed={item.status === 'error'}
            loading={item.status === 'processing'}
            label={item.label}
            containerStyle={{
              marginTop: index === 0 ? 0 : theme.spacing.m,
            }}
          />
        ))}
      </View>
    </View>
  )
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
  })

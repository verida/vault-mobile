import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { ProgressBar } from '~/components'
import { AnimatedCheckbox } from '~/components/Input'
import { useTheme } from '~/contexts'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type StatusListItem = {
  status: 'idle' | 'success' | 'error' | 'processing'
  label: string
  displayProgressBar?: boolean
  progressIndeterminate?: boolean
  progress?: number
  disabled?: boolean
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
          <React.Fragment key={item.label}>
            <AnimatedCheckbox
              key={item.label}
              checked={item.status === 'success'}
              failed={item.status === 'error'}
              loading={item.status === 'processing'}
              label={item.label}
              containerStyle={{
                marginTop: index === 0 ? 0 : theme.spacing.m,
              }}
              textStyle={
                item.disabled ? { color: theme.color.textLightGrey } : {}
              }
            />
            {item.displayProgressBar ? (
              <View style={styles.progressBarContainer}>
                <ProgressBar
                  progress={item.progress || 0}
                  color={theme.color.success}
                  indeterminate={item.progressIndeterminate && !item.progress}
                />
              </View>
            ) : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    progressBarContainer: {
      marginTop: theme.spacing.m,
      marginLeft: theme.spacing.s + 20,
    },
  })

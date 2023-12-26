import { EnvironmentType } from '@verida/types'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'

import { Theme } from 'styles/types'

export type NetworkIndicatorSize = 'default' | 'compact'

export type NetworkIndicatorProps = ViewProps & {
  network: EnvironmentType
  size?: NetworkIndicatorSize
}

export const NetworkIndicator: React.FunctionComponent<NetworkIndicatorProps> =
  (props) => {
    const { network, size = 'default', ...viewProps } = props

    const styles = useThemeAwareStyle(createStyles)
    const networkStyle = styles[network]

    return (
      <View {...viewProps}>
        <View
          style={[
            styles.container,
            size === 'compact'
              ? styles.containerCompact
              : styles.containerDefault,
            networkStyle,
          ]}>
          <Text
            style={[
              styles.label,
              size === 'compact' ? styles.labelCompact : styles.labelDefault,
            ]}
            numberOfLines={1}>
            {network}
          </Text>
        </View>
      </View>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignSelf: 'center',
      borderRadius: theme.roundness.full,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
    },
    containerDefault: {
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xxs,
    },
    containerCompact: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
    },
    mainnet: {
      backgroundColor: theme.color.veridaGreen,
    },
    testnet: {
      backgroundColor: theme.color.warning,
    },
    devnet: {
      backgroundColor: theme.color.error,
    },
    local: {
      backgroundColor: theme.color.error,
    },
    label: {
      color: theme.color.onPrimary,
      textAlign: 'center',
      textTransform: 'capitalize',
    },
    labelDefault: {
      fontSize: theme.fontSize.s,
      lineHeight: 16,
    },
    labelCompact: {
      fontSize: theme.fontSize.xs,
      lineHeight: 12,
    },
  })

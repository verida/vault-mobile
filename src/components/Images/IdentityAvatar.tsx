import { EnvironmentType } from '@verida/types'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { NetworkIndicator, NetworkIndicatorProps } from 'components/Network'
import { ShimmerPlaceholder } from 'components/ShimmerPlaceholder'
import { Theme } from 'styles/types'

import { Avatar, AvatarProps } from './Avatar'

export type IdentityAvatarProps = Pick<
  NetworkIndicatorProps,
  'network' | 'size'
> &
  Pick<AvatarProps, 'source'> & {
    loading?: boolean
  } & ViewProps

export const IdentityAvatar: React.FunctionComponent<IdentityAvatarProps> = (
  props
) => {
  const { loading, network, size, source, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <ShimmerPlaceholder visible={loading} shimmerStyle={styles.shimmer}>
          <Avatar source={source} fallbackType='person' />
        </ShimmerPlaceholder>
        {network === EnvironmentType.MAINNET ? null : (
          <NetworkIndicator
            network={network}
            size={size}
            style={{
              transform: [{ translateY: size === 'compact' ? -16 : -20 }],
            }}
          />
        )}
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    shimmer: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: theme.roundness.full,
    },
    networkIndicator: {
      transform: [{ translateY: -16 }],
    },
  })

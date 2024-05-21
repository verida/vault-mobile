import { Network } from '@verida/types'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { NetworkIndicator, NetworkIndicatorProps } from 'components/Network'
import { Theme } from 'styles/types'

import { Avatar, AvatarProps } from './Avatar'

export type IdentityAvatarProps = Pick<AvatarProps, 'source'> & {
  network?: Network
  networkIndicatorSize?: NetworkIndicatorProps['size']
  loading?: boolean
} & ViewProps

export const IdentityAvatar: React.FunctionComponent<IdentityAvatarProps> = (
  props
) => {
  const { network, networkIndicatorSize, source, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <Avatar source={source} fallbackType='person' />
        {network && network !== Network.MYRTLE ? (
          <NetworkIndicator
            network={network}
            size={networkIndicatorSize}
            style={{
              transform: [
                { translateY: networkIndicatorSize === 'compact' ? -16 : -20 },
              ],
            }}
          />
        ) : null}
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      aspectRatio: 1,
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

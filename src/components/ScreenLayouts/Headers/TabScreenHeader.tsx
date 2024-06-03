import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import React, { useCallback } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { IdentityAvatar } from '~/components'
import { HIT_SLOP_10_10 } from '~/constants/buttons'
import { useIdentityDrawer } from '~/features/identityDrawer'
import { selectSelectedPublicProfile } from '~/features/profiles'
import { useThemeAwareStyle } from '~/hooks'
import { useAppSelector } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

import { BaseScreenHeader } from './BaseScreenHeader'

export type TabScreenHeaderProps = BottomTabHeaderProps

export const TabScreenHeader: React.FunctionComponent<TabScreenHeaderProps> = (
  props
) => {
  const { navigation, options, ...otherProps } = props

  const { headerLeft: customLeft, headerRight: customRight } = options

  const styles = useThemeAwareStyle(createStyles)

  const { avatar } = useAppSelector(selectSelectedPublicProfile)

  const { open: openIdentityDrawer } = useIdentityDrawer()

  const headerLeft: typeof options.headerLeft = useCallback(
    () => (
      <TouchableOpacity
        onPress={openIdentityDrawer}
        hitSlop={HIT_SLOP_10_10}
        style={styles.avatarButton}>
        <IdentityAvatar source={avatar?.uri} style={styles.avatar} />
      </TouchableOpacity>
    ),
    [avatar?.uri, styles.avatarButton, styles.avatar, openIdentityDrawer]
  )

  return (
    <BaseScreenHeader
      {...otherProps}
      navigation={navigation}
      options={{
        ...options,
        headerLeft: customLeft || headerLeft,
        headerRight: customRight,
      }}
    />
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    avatarButton: {
      marginLeft: theme.spacing.m,
    },
    avatar: {
      width: 32,
      aspectRatio: 1,
    },
    inboxButton: {
      marginRight: theme.spacing.m,
    },
    badge: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
      position: 'absolute',
      right: -7,
      top: -9,
      height: 20,
      minWidth: 20,
      backgroundColor: theme.color.orange,
      borderRadius: theme.roundness.full,
      overflow: 'hidden',
      borderColor: theme.color.background,
      borderWidth: 2,
    },
    badgeText: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 10,
      lineHeight: 12,
      color: theme.color.onError,
    },
  })

import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { Icon, IdentityAvatar } from 'components'
import { useTheme } from 'contexts'
import { useIdentityDrawer } from 'features/identityDrawer'
import { selectNewMessagesCount } from 'features/inbox'
import { selectSelectedPublicProfile } from 'features/profiles'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { HIT_SLOP_10_10 } from 'constants/buttons'
import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

import { BaseScreenHeader } from './BaseScreenHeader'

const MAX_INBOX_COUNT = 10

export type TabScreenHeaderProps = BottomTabHeaderProps

export const TabScreenHeader: React.FunctionComponent<TabScreenHeaderProps> = (
  props
) => {
  const { navigation, options, ...otherProps } = props

  const { headerLeft: customLeft, headerRight: customRight } = options

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const { avatar } = useAppSelector(selectSelectedPublicProfile)

  const { open: openIdentityDrawer } = useIdentityDrawer()

  const unreadMessagesCount = useAppSelector(selectNewMessagesCount)
  const displayedInboxCount =
    unreadMessagesCount >= MAX_INBOX_COUNT
      ? `${MAX_INBOX_COUNT - 1}+`
      : unreadMessagesCount

  const handleInboxPress = useCallback(() => {
    navigation.navigate('Inbox')
  }, [navigation])

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

  const headerRight: typeof options.headerRight = useCallback(
    () => (
      <TouchableOpacity
        onPress={handleInboxPress}
        hitSlop={HIT_SLOP_10_10}
        style={styles.inboxButton}>
        {/* TODO: Factorise an Inbox icon button with its badge for unread messages */}
        <Icon name='inbox' size={theme.iconSize.m} />
        {/* TODO: Factorise a Badge component */}
        {unreadMessagesCount ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {displayedInboxCount}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    ),
    [
      displayedInboxCount,
      handleInboxPress,
      styles.inboxButton,
      styles.badge,
      styles.badgeText,
      theme.iconSize.m,
      unreadMessagesCount,
    ]
  )

  return (
    <BaseScreenHeader
      {...otherProps}
      navigation={navigation}
      options={{
        ...options,
        headerLeft: customLeft || headerLeft,
        headerRight: customRight || headerRight,
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

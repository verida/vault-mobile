import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '~/contexts'
import { useInboxUnreadMessageCount } from '~/features/inbox/hooks'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import { Icon } from './Icon'

export const InboxIcon = () => {
  const { unreadMessagesCount, displayedInboxCount } =
    useInboxUnreadMessageCount()

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  return (
    <View>
      <Icon name='inbox' size={theme.iconSize.m} />
      {unreadMessagesCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {displayedInboxCount}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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

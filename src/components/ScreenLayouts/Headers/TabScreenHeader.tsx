import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { Icon, IdentityAvatar } from 'components'
import { useTheme } from 'contexts'
import { selectNewMessagesCount } from 'features/inbox'
import { selectSelectedPublicProfile } from 'features/profiles'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback } from 'react'
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

const HIT_SLOP = { top: 10, right: 10, bottom: 10, left: 10 }
const MAX_INBOX_COUNT = 10

export type TabScreenHeaderProps = {
  hideSeparator?: boolean
} & BottomTabHeaderProps

export const TabScreenHeader: React.FunctionComponent<TabScreenHeaderProps> = (
  props
) => {
  const { navigation, options, hideSeparator = false } = props

  const { title, headerTitle } = options

  const insets = useSafeAreaInsets()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const { avatar } = useAppSelector(selectSelectedPublicProfile)

  const unreadMessagesCount = useAppSelector(selectNewMessagesCount)
  const displayedInboxCount =
    unreadMessagesCount >= MAX_INBOX_COUNT
      ? `${MAX_INBOX_COUNT - 1}+`
      : unreadMessagesCount

  const handleInboxPress = useCallback(() => {
    navigation.navigate('Inbox')
  }, [navigation])

  return (
    <>
      <StatusBar
        barStyle='dark-content'
        translucent
        backgroundColor={theme.color.background}
      />
      <View
        style={[
          styles.container,
          !hideSeparator && styles.containerSeparator,
          {
            paddingTop: insets.top,
            paddingLeft: insets.left + theme.spacing.m,
            paddingRight: insets.right + theme.spacing.m,
          },
        ]}>
        {/* TODO: Surround the avatar with a touchable to open the drawer */}
        <IdentityAvatar source={avatar?.uri} style={styles.avatar} />
        <View style={styles.titleContainer}>
          {headerTitle ? (
            headerTitle
          ) : (
            <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>
              {title}
            </Text>
          )}
        </View>
        <View style={styles.actionsContainer}>
          {/* TODO: Factorise the icon buttons */}
          <TouchableOpacity onPress={handleInboxPress} hitSlop={HIT_SLOP}>
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
        </View>
      </View>
    </>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.m,
      backgroundColor: theme.color.background,
      flexDirection: 'row',
      alignItems: 'center',
    },
    containerSeparator: {
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
    avatar: {
      marginVertical: 6,
      marginRight: theme.spacing.m,
      width: 32,
      aspectRatio: 1,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      marginVertical: 6,
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.sl,
      lineHeight: 32,
      textAlign: 'center',
    },
    actionsContainer: {
      marginVertical: 6,
      marginLeft: theme.spacing.m,
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionIcon: {
      marginLeft: theme.spacing.s,
      color: theme.color.iconDefault,
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

import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { EnvironmentType } from '@verida/types'
import { Icon, IdentityAvatar } from 'components'
import { useTheme } from 'contexts'
import {
  getAddressFromDID,
  getNetworkFromDID,
  useCurrentIdentity,
} from 'features/identities'
import { useIdentityDrawer } from 'features/identityDrawer'
import { selectNewMessagesCount } from 'features/inbox'
import {
  PROFILE_EMPTY_NAME_VALUE,
  selectPublicProfilesLoadingState,
  useCurrentProfile,
} from 'features/profiles'
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

import { ShimmerPlaceholder } from 'components/ShimmerPlaceholder'
import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

const HIT_SLOP = { top: 10, right: 10, bottom: 10, left: 10 }
const MAX_INBOX_COUNT = 10

export type HomeScreenHeaderProps = BottomTabHeaderProps

export const HomeScreenHeader: React.FunctionComponent<
  HomeScreenHeaderProps
> = (props) => {
  const { navigation } = props

  const insets = useSafeAreaInsets()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const identity = useCurrentIdentity()
  const { avatar, name } = useCurrentProfile()
  const isNameEmpty = !name
  const displayedName = name || PROFILE_EMPTY_NAME_VALUE

  const loadingState = useAppSelector((state) =>
    selectPublicProfilesLoadingState(state, identity?.did)
  )
  // TODO: Why do we have to call selectSelectedPublicProfile, why the profile is not in selectSelectedAccount?!

  const network = identity?.did
    ? getNetworkFromDID(identity?.did)
    : EnvironmentType.MAINNET
  const displayedDid = identity?.did ? getAddressFromDID(identity?.did) : ''

  const { open: openIdentityDrawer } = useIdentityDrawer()

  const unreadMessagesCount = useAppSelector(selectNewMessagesCount)
  const displayedInboxCount =
    unreadMessagesCount >= MAX_INBOX_COUNT
      ? `${MAX_INBOX_COUNT - 1}+`
      : unreadMessagesCount

  const handleInboxPress = useCallback(() => {
    navigation.navigate('Inbox')
  }, [navigation])

  const handleScanQrCodePress = useCallback(() => {
    navigation.navigate('ScanQrCode', {
      firstTime: false,
    })
  }, [navigation])

  return (
    <>
      <StatusBar
        barStyle={theme.statusBar.defaultStyle}
        backgroundColor='transparent'
        translucent
      />
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + theme.spacing.m,
            paddingLeft: insets.left + theme.spacing.m,
            paddingRight: insets.right + theme.spacing.m,
          },
        ]}>
        <TouchableOpacity
          onPress={openIdentityDrawer}
          activeOpacity={0.4}
          hitSlop={HIT_SLOP}
          style={styles.identityContainer}>
          <IdentityAvatar
            source={avatar?.uri}
            network={network}
            networkIndicatorSize='compact'
            style={styles.avatar}
          />
          <View style={styles.nameAndDidContainer}>
            <View style={styles.nameContainer}>
              <ShimmerPlaceholder
                visible={!loadingState.loading}
                style={styles.nameShimmer}>
                <Text
                  style={
                    isNameEmpty ? [styles.name, styles.emptyName] : styles.name
                  }
                  numberOfLines={1}
                  ellipsizeMode='tail'>
                  {displayedName}
                </Text>
              </ShimmerPlaceholder>
              <Icon name='chevron-forward' size={16} />
            </View>
            <Text style={styles.did} numberOfLines={1} ellipsizeMode='middle'>
              {displayedDid}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.actionsContainer}>
          {/* TODO: Factorise the icon buttons */}
          <TouchableOpacity onPress={handleScanQrCodePress} hitSlop={HIT_SLOP}>
            <Icon name='scan-qr' size={theme.iconSize.m} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleInboxPress}
            hitSlop={HIT_SLOP}
            style={styles.firstActionIcon}>
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
      padding: theme.spacing.m,
      backgroundColor: theme.color.background,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
    identityContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    avatar: {
      width: 48,
      aspectRatio: 1,
    },
    nameAndDidContainer: {
      flex: 1,
      marginLeft: theme.spacing.m,
      justifyContent: 'flex-end',
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    nameShimmer: {
      flexShrink: 1,
      height: 20 * 1.35,
      borderRadius: theme.roundness.s,
    },
    name: {
      fontFamily: theme.fontFamily.bold,
      fontSize: 20, // TODO: Add missing font size in the theme
      lineHeight: 20 * 1.35,
    },
    emptyName: {
      color: theme.color.textLightGrey,
      fontStyle: 'italic', // FIXME: Italic not applied
    },
    did: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.s, // 12
      lineHeight: theme.fontSize.s * 1.5, // 12 * 1.5 = 18
      color: theme.color.textLightGrey,
    },
    actionsContainer: {
      marginLeft: theme.spacing.m,
      flexDirection: 'row',
      alignItems: 'center',
    },
    firstActionIcon: {
      marginLeft: theme.spacing.m,
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

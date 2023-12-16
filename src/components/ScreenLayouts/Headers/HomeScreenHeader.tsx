import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { EnvironmentType } from '@verida/types'
import { IdentityAvatar } from 'components'
import { useTheme } from 'contexts'
import {
  getAddressFromDID,
  getNetworkFromDID,
  selectSelectedAccount,
} from 'features/identities'
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
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

const HIT_SLOP = { top: 10, right: 10, bottom: 10, left: 10 }
const MAX_INBOX_COUNT = 10

export type HomeScreenHeaderProps = BottomTabHeaderProps

export const HomeScreenHeader: React.FunctionComponent<HomeScreenHeaderProps> =
  (props) => {
    const { navigation } = props

    const insets = useSafeAreaInsets()
    const styles = useThemeAwareStyle(createStyles)
    const { theme } = useTheme()

    const identity = useAppSelector(selectSelectedAccount)
    const { avatar, name } = useAppSelector(selectSelectedPublicProfile)
    // TODO: Why do we have to call selectSelectedPublicProfile, why the profile is not in selectSelectedAccount?!

    const network = identity?.did
      ? getNetworkFromDID(identity?.did)
      : EnvironmentType.MAINNET
    const displayedDid = identity?.did ? getAddressFromDID(identity?.did) : ''

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
          barStyle='dark-content'
          translucent
          backgroundColor={theme.color.background}
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
          {/* TODO: Surround the avatar and name with a touchable to open the drawer */}
          <IdentityAvatar
            source={avatar?.uri}
            network={network}
            networkIndicatorSize='compact'
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode='tail'>
              {name}
            </Text>
            <Text style={styles.did} numberOfLines={1} ellipsizeMode='middle'>
              {displayedDid}
            </Text>
          </View>
          <View style={styles.actionsContainer}>
            {/* TODO: Factorise the icon buttons */}
            <TouchableOpacity
              onPress={handleScanQrCodePress}
              hitSlop={HIT_SLOP}>
              <MaterialIcon
                name='qrcode-scan'
                size={24}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleInboxPress}
              hitSlop={HIT_SLOP}
              style={styles.firstActionIcon}>
              {/* TODO: Factorise an Inbox icon button with its badge for unread messages */}
              <MaterialIcon name='email' size={24} style={styles.actionIcon} />
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
    avatar: {
      width: 48,
      aspectRatio: 1,
    },
    nameContainer: {
      flex: 1,
      marginLeft: theme.spacing.m,
    },
    name: {
      fontFamily: theme.fontFamily.bold,
      fontSize: 20, // TODO: Add missing font size in the theme
      lineHeight: 20 * 1.35,
    },
    did: {
      marginTop: 1,
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.s,
      lineHeight: theme.fontSize.s * 1.5,
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
    actionIcon: {
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

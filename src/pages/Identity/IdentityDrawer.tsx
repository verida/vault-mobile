import { useNavigation } from '@react-navigation/native'
import { EnvironmentType } from '@verida/types'
import {
  BottomActionBar,
  DrawerIdentityList,
  DrawerShortcutButton,
  IdentityAvatar,
} from 'components'
import { useTheme } from 'contexts'
import { getNetworkFromDID, selectSelectedAccount } from 'features/identities'
import { useIdentityDrawer } from 'features/identityDrawer'
import { selectSelectedPublicProfile } from 'features/profiles'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Drawer } from 'react-native-drawer-layout'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

export type IdentityDrawerProps = {
  children: React.ReactNode
}

export const IdentityDrawer: React.FunctionComponent<IdentityDrawerProps> = (
  props
) => {
  const { children } = props

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const { isOpen, open, close } = useIdentityDrawer()
  const navigation = useNavigation()
  const identity = useAppSelector(selectSelectedAccount)
  const { avatar, name } = useAppSelector(selectSelectedPublicProfile)
  // TODO: Why do we have to call selectSelectedPublicProfile, why the profile is not in selectSelectedAccount?!

  const network = identity?.did
    ? getNetworkFromDID(identity.did)
    : EnvironmentType.MAINNET

  const handleAddIdentity = useCallback(() => {
    navigation.navigate('AddIdentity', { firstIdentity: false })
    close()
  }, [navigation, close])

  const handleShareIdentityPress = useCallback(() => {
    navigation.navigate('ShareIdentity')
    close()
  }, [navigation, close])

  const handleViewProfilePress = useCallback(() => {
    navigation.navigate('Tabs', {
      screen: 'Profile',
    })
    close()
  }, [navigation, close])

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings', {
      onSelectAccount: () => {
        // TODO: To remove when Settings go rid of its params
      },
      onLogoutAccounts: () => {
        // TODO: To remove when Settings go rid of its params
      },
    } as any)
    close()
  }, [navigation, close])

  return (
    <Drawer
      open={isOpen}
      onOpen={open}
      onClose={close}
      drawerStyle={styles.drawerStyle}
      renderDrawerContent={() => (
        <View
          style={[
            styles.container,
            {
              marginTop: insets.top,
              marginBottom: insets.bottom,
              marginLeft: insets.left,
              marginRight: insets.right,
            },
          ]}>
          <View style={styles.contentContainer}>
            <View style={styles.infoContainer}>
              <IdentityAvatar
                source={avatar}
                network={network}
                style={styles.avatar}
              />
              <Text style={styles.name} numberOfLines={1} ellipsizeMode='tail'>
                {name}
              </Text>
              <Text style={styles.did} numberOfLines={2} ellipsizeMode='middle'>
                {identity?.did}
              </Text>
            </View>
            <View style={styles.shortcutsContainer}>
              <DrawerShortcutButton
                label='Share my Identity'
                icon={
                  <Ionicons
                    name='qr-code-outline'
                    size={24}
                    color={theme.color.iconDefault}
                  />
                }
                onPress={handleShareIdentityPress}
                style={styles.shortcutButton}
              />
              <DrawerShortcutButton
                label='View my Profile'
                icon={
                  <Ionicons
                    name='person'
                    size={24}
                    color={theme.color.iconDefault}
                  />
                }
                onPress={handleViewProfilePress}
                style={styles.shortcutButton}
              />
              <DrawerShortcutButton
                label='Settings'
                icon={
                  <Ionicons
                    name='settings-sharp'
                    size={24}
                    color={theme.color.iconDefault}
                  />
                }
                onPress={handleSettingsPress}
                style={styles.shortcutButton}
              />
            </View>
            <View style={styles.identitiesContainer}>
              <View style={styles.identitiesLabelContainer}>
                <Text style={styles.switchIdentityLabel}>Switch Identity</Text>
              </View>
              <DrawerIdentityList style={styles.identityList} />
            </View>
          </View>
          <BottomActionBar
            actions={[
              {
                label: 'Add Identity',
                onPress: handleAddIdentity,
                color: 'grey',
              },
            ]}
          />
        </View>
      )}>
      {children}
    </Drawer>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    drawerStyle: {
      backgroundColor: theme.color.background,
      width: '80%',
    },
    container: {
      flex: 1,
      // padding: theme.spacing.m,
    },
    contentContainer: {
      flex: 1,
    },
    infoContainer: {
      paddingTop: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      paddingBottom: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
      alignItems: 'center',
    },
    avatar: {
      width: 80,
      aspectRatio: 1,
    },
    name: {
      marginTop: theme.spacing.s,
      textAlign: 'center',
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.xxl,
      lineHeight: theme.fontSize.xxl * 1.35,
    },
    did: {
      marginTop: theme.spacing.s,
      paddingHorizontal: theme.spacing.xxl,
      textAlign: 'center',
      fontFamily: theme.fontFamily.semibold,
      fontSize: theme.fontSize.s,
      lineHeight: theme.fontSize.s * 1.5,
      color: theme.color.textLightGrey,
    },
    shortcutsContainer: {
      flex: 1,
      padding: theme.spacing.m,
    },
    shortcutButton: {
      marginBottom: theme.spacing.m,
    },
    identitiesContainer: {},
    identitiesLabelContainer: {
      paddingTop: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      paddingBottom: theme.spacing.s,
    },
    switchIdentityLabel: {
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.fontSize.sl,
      lineHeight: theme.fontSize.sl * 1.3,
      color: theme.color.black700,
    },
    identityList: {
      borderTopColor: theme.color.lightGrey,
      borderTopWidth: 1,
    },
  })

import { useNavigation } from '@react-navigation/native'
import { EnvironmentType } from '@verida/types'
import React, { useCallback } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Drawer } from 'react-native-drawer-layout'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'

import {
  DrawerIdentityList,
  DrawerShortcutButton,
  Icon,
  IdentityAvatar,
  Typography,
} from '~/components'
import { useTheme } from '~/contexts'
import { getNetworkFromDID, selectSelectedAccount } from '~/features/identities'
import { useIdentityDrawer } from '~/features/identityDrawer'
import {
  PROFILE_EMPTY_NAME_VALUE,
  selectSelectedPublicProfile,
} from '~/features/profiles'
import { useThemeAwareStyle } from '~/hooks'
import { useAppSelector } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

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
  const isNameEmpty = !name
  const displayedName = name || PROFILE_EMPTY_NAME_VALUE

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
    navigation.navigate('Settings')
    close()
  }, [navigation, close])

  const handleIdentitySwitch = useCallback(() => {
    close()
  }, [close])

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
            <View>
              <View style={styles.infoContainer}>
                <IdentityAvatar
                  source={avatar}
                  network={network}
                  networkIndicatorSize='default'
                  style={styles.avatar}
                />
                <Typography
                  variant='h3'
                  style={
                    isNameEmpty ? [styles.name, styles.emptyName] : styles.name
                  }
                  numberOfLines={1}
                  ellipsizeMode='tail'>
                  {displayedName}
                </Typography>
                <Typography
                  variant='label'
                  style={styles.did}
                  numberOfLines={2}
                  ellipsizeMode='middle'>
                  {identity?.did}
                </Typography>
              </View>
              <View style={styles.shortcutsContainer}>
                <DrawerShortcutButton
                  label='Share Identity'
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
                  label='View Profile'
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
            </View>
            <View style={styles.identitiesContainer}>
              <View style={styles.identitiesLabelContainer}>
                <Typography variant='h4' style={styles.identityListLabel}>
                  Identities
                </Typography>
                <TouchableOpacity
                  onPress={handleAddIdentity}
                  style={styles.addIdentityButton}>
                  <Icon name='add' size={24} color={theme.color.primary} />
                  <Typography
                    variant='h4'
                    style={styles.addIdentityButtonLabel}>
                    Add
                  </Typography>
                </TouchableOpacity>
              </View>
              <DrawerIdentityList
                onIdentitySwitch={handleIdentitySwitch}
                style={styles.identityList}
              />
            </View>
          </View>
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
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
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
    },
    emptyName: {
      color: theme.color.textLightGrey,
      fontStyle: 'italic', // FIXME: Italic not applied
    },
    did: {
      marginTop: theme.spacing.s,
      paddingHorizontal: theme.spacing.l,
      textAlign: 'center',
      color: theme.color.textLightGrey,
    },
    shortcutsContainer: {
      padding: theme.spacing.m,
    },
    shortcutButton: {
      marginBottom: theme.spacing.m,
    },
    identitiesContainer: {
      flexShrink: 1,
      paddingBottom: theme.spacing.s,
    },
    identitiesLabelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      paddingBottom: theme.spacing.s,
    },
    identityListLabel: {
      color: theme.color.black700,
    },
    addIdentityButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addIdentityButtonLabel: {
      color: theme.color.primary,
    },
    identityList: {
      flexShrink: 1,
      borderTopColor: theme.color.lightGrey,
      borderTopWidth: 1,
      borderBottomColor: theme.color.lightGrey,
      borderBottomWidth: 1,
    },
  })

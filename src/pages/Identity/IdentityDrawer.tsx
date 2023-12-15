import { useNavigation } from '@react-navigation/native'
import { EnvironmentType } from '@verida/types'
import { BottomActionBar, IdentityAvatar } from 'components'
import { getNetworkFromDID, selectSelectedAccount } from 'features/identities'
import { useIdentityDrawer } from 'features/identityDrawer'
import { selectSelectedPublicProfile } from 'features/profiles'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Drawer } from 'react-native-drawer-layout'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
  const insets = useSafeAreaInsets()
  const { isOpen, open, close } = useIdentityDrawer()
  const navigation = useNavigation()
  const identity = useAppSelector(selectSelectedAccount)
  const { avatar, name } = useAppSelector(selectSelectedPublicProfile)

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
            <View style={styles.identityInfoContainer}>
              <IdentityAvatar
                source={avatar}
                network={network}
                style={styles.identityAvatar}
              />
              <Text style={styles.identityName}>{name}</Text>
              <Text style={styles.identityDid}>{identity?.did}</Text>
            </View>
            <View style={styles.identityShortcutsContainer}>
              <TouchableOpacity onPress={handleShareIdentityPress}>
                <Text>Share my Identity</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleViewProfilePress}>
                <Text>View my Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSettingsPress}>
                <Text>Settings</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.identitiesContainer}>
              <Text>Switch Identity</Text>
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
    identityInfoContainer: {
      paddingTop: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      paddingBottom: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
      alignItems: 'center',
    },
    identityAvatar: {
      width: 80,
      aspectRatio: 1,
    },
    identityName: {
      marginTop: theme.spacing.s,
    },
    identityDid: {
      marginTop: theme.spacing.s,
    },
    identityShortcutsContainer: {
      flex: 1,
    },
    identitiesContainer: {},
  })

import { ScreenWrapper } from 'components'
import { useTheme } from 'contexts'
import { selectSelectedAccount } from 'features/identities'
import { useThemeAwareStyle } from 'hooks'
import { Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TextStyle, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import PropertyList from 'components/PropertyList'
import Text from 'components/Text'
import { APP_NAME, APP_VERSION_FORMATTED } from 'constants/application'
import { MainStackScreenProps } from 'navigation/types'
import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

import AddAccountsModal from '../Dashboard/AddAccountsModal'

type SettingsItem = {
  // TODO: Get it from the props of the component
  label: string
  action?: 'arrow'
  text?: TextStyle
  optional?: boolean
  onPress?: () => void
}

type SettingsCategory = {
  label: string
  subtext?: string
  items: SettingsItem[]
}

export type SettingsScreenParams = {
  onLogoutAccounts?: (dids: string[]) => void // TODO: To remove once the log out is performed directly rather than through a function in the HomeScreen
}

type SettingsScreenProps = MainStackScreenProps<'Settings'>

export const SettingsScreen: React.FC<SettingsScreenProps> = (props) => {
  const {
    navigation,
    route: { params },
  } = props

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  const handleBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  useEffect(() => {
    navigation.setOptions({
      title: 'Settings',
    })
  }, [navigation, handleBack])

  const currentIdentity = useAppSelector(selectSelectedAccount) // TODO: Use useCurrentIdentity when available

  const [loading, setLoading] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const handleDisplayLogoutModal = useCallback(() => {
    setShowLogout(true)
  }, [])

  const settingsItems: SettingsCategory[] = [
    {
      label: 'General',
      items: [
        {
          label: 'Change PIN',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('ChangePin'),
        },
      ],
    },
    {
      label: 'Identity',
      subtext: currentIdentity?.did,
      items: [
        {
          label: 'Seed Phrase',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('SeedPhraseView'),
        },
        {
          label: 'Login History',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('LoginHistory'),
        },
        {
          label: 'Log Out',
          text: styles.logoutText,
          optional: true,
          onPress: () => handleDisplayLogoutModal(),
        },
        {
          label: 'Delete Identity',
          text: styles.logoutText,
          optional: true,
          onPress: () => navigation.navigate('DeleteIdentity'),
        },
      ],
    },
    {
      label: 'Blockchains',
      items: [
        {
          label: 'DApp Connections',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('WalletConnectActiveSessions'),
        },
      ],
    },
    {
      label: 'Polygon ID',
      items: [
        {
          label: 'Circuits',
          action: 'arrow',
          optional: true,
          onPress: () => navigation.navigate('PolygonIdCircuitsSettings'),
        },
      ],
    },
  ]

  const walletAppVersion = `${APP_NAME} ${APP_VERSION_FORMATTED}`

  if (loading) return <LoadingView />

  return (
    <ScreenWrapper
      backgroundColor={theme.color.snow}
      // TODO: Disable the bottom safe area (props added in another branch, need merge to get it)
    >
      <NavigationHeader // TODO: Get rid of the following when properly handling a common header in the navigator
        title='Settings'
        left={{
          icon: <IconNativeBase name='arrow-back' style={{ color: '#000' }} />,
          action: () => props.navigation.goBack(),
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: insets.bottom,
          },
        ]}>
        {settingsItems.map((category) => (
          <View key={category.label} style={styles.categoryContainer}>
            <View style={styles.categoryLabelContainer}>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              {category.subtext ? (
                <Text
                  style={styles.categorySubtext}
                  numberOfLines={1}
                  ellipsizeMode='tail'>
                  {category.subtext}
                </Text>
              ) : null}
            </View>
            <PropertyList list={category.items} />
          </View>
        ))}

        <Text style={styles.appVersion}>{walletAppVersion}</Text>

        <AddAccountsModal
          visible={showLogout}
          onClose={() => {
            setShowLogout(false)
          }}
          showLogout
          onLogoutAccounts={params.onLogoutAccounts}
          setLoading={setLoading}
        />
      </ScrollView>
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.m,
    },
    categoryContainer: {
      marginTop: theme.spacing.l,
    },
    categoryLabelContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.s,
    },
    categoryLabel: {
      fontSize: theme.fontSize.s,
      fontFamily: theme.fontFamily.bold,
      color: theme.color.black600,
      textTransform: 'uppercase',
    },
    categorySubtext: {
      flex: 1,
      marginLeft: theme.spacing.s,
      fontSize: theme.fontSize.s,
      fontFamily: theme.fontFamily.bold,
      color: theme.color.black600,
    },
    logoutText: {
      color: theme.color.orange,
    },
    appVersion: {
      textAlign: 'center',
      color: theme.color.black,
      marginTop: theme.spacing.l,
    },
  })

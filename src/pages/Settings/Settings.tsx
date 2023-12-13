import { useThemeAwareStyle } from 'hooks'
import { Icon } from 'native-base'
import React, { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, TextStyle, View } from 'react-native'

import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import PropertyList from 'components/PropertyList'
import Text from 'components/Text'
import { APP_NAME, APP_VERSION_FORMATTED } from 'constants/application'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { MainStackScreenProps } from 'navigation/types'
import LayoutStyle from 'styles/layouts'
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
          onPress: () =>
            navigation.navigate('DeleteIdentity', {
              onLogoutAccounts: params.onLogoutAccounts,
            }),
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

  const versionText = `${APP_NAME} ${APP_VERSION_FORMATTED}`

  if (loading) return <LoadingView />

  return (
    <View style={styles.container}>
      <NavigationHeader
        title='Settings'
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => props.navigation.goBack(),
        }}
      />
      <ScrollView>
        <View style={LayoutStyle.layout}>
          {settingsItems.map((category) => (
            <View key={category.label}>
              <Text style={styles.title}>{category.label}</Text>
              <PropertyList list={category.items} />
            </View>
          ))}

          <Text style={styles.versionText}>{versionText}</Text>
        </View>
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
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontSize: 12,
      fontFamily: NUNITO_SANS_BOLD,
      color: theme.color.black600,
      textTransform: 'uppercase',
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.s,
    },
    logoutText: {
      color: theme.color.orange,
    },
    versionText: {
      color: theme.color.black,
      marginTop: theme.spacing.m,
    },
  })

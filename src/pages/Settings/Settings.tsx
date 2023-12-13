import { useThemeAwareStyle } from 'hooks'
import { Icon } from 'native-base'
import React, { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

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

export type SettingsScreenParams = {
  onSelectAccount?: (did: string) => void
  onLogoutAccounts?: (dids: string[]) => void
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

  const generalList = [
    {
      label: 'Change PIN',
      action: 'arrow',
      optional: true,
      onPress: () => navigation.navigate('ChangePin'),
    },
  ]

  const currentIdentityList = [
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
          onSelectAccount: params.onSelectAccount,
          onLogoutAccounts: params.onLogoutAccounts,
        }),
    },
  ]

  const blockchainList = [
    {
      label: 'DApp Connections',
      action: 'arrow',
      optional: true,
      onPress: () => navigation.navigate('WalletConnectActiveSessions'),
    },
  ]

  const PolygonIdList = [
    {
      label: 'Circuits',
      action: 'arrow',
      optional: true,
      onPress: () => navigation.navigate('PolygonIdCircuitsSettings'),
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
          <Text style={styles.title}>General</Text>
          <View>
            <PropertyList list={generalList} />
          </View>

          <Text style={styles.title}>Identity</Text>
          <View>
            <PropertyList list={currentIdentityList} />
          </View>

          <Text style={styles.title}>Blockchain</Text>
          <View>
            <PropertyList list={blockchainList} />
          </View>

          <Text style={styles.title}>Polygon ID</Text>
          <View>
            <PropertyList list={PolygonIdList} />
          </View>

          <Text style={styles.versionText}>{versionText}</Text>
        </View>
        <AddAccountsModal
          visible={showLogout}
          onClose={() => {
            setShowLogout(false)
          }}
          showLogout
          onSelectAccount={params.onSelectAccount}
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

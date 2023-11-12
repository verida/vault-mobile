import { config } from 'config'
import { capitalize, isEmpty } from 'lodash'
import { Icon } from 'native-base'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import { useAuth } from 'hooks/useAuth'

import PropertyList from '../components/PropertyList'
import { APP_NAME, APP_VERSION_FORMATTED } from '../constants'
import {
  BLACK_COLOR,
  BLACK_COLOR_OPACITY,
  ORANGE_COLOR,
} from '../constants/color'
import { NUNITO_SANS_BOLD } from '../constants/text'
import LayoutStyle from '../styles/layouts'
import AddAccountsModal from './Dashboard/AddAccountsModal'

const publicList = [
  {
    label: 'Change PIN',
    action: 'arrow',
    optional: true,
    onPress: (navigation) => navigation.navigate('ChangePin'),
  },
  {
    label: 'Seed Phrase',
    action: 'arrow',
    optional: true,
    onPress: (navigation) => navigation.navigate('SeedPhraseView'),
  },
  // { label: "Notifications", action: "arrow" },
  {
    label: 'Login History',
    action: 'arrow',
    optional: true,
    onPress: (navigation) => navigation.navigate('LoginHistory'),
  },
]

// const manageWalletOption = {
//   label: 'Manage Wallets',
//   action: 'arrow',
//   optional: true,
//   onPress: (navigation) => navigation.navigate('ManageWallets'),
// }

// const teamList = [manageWalletOption, ...publicList]
const teamList = publicList

const generalList = []

const BlockchainList = [
  {
    label: 'Networks',
    action: 'arrow',
    optional: true,
    onPress: (navigation) => navigation.navigate('Networks'),
    //value: 'Testnet',
  },
  {
    label: 'DApps',
    action: 'arrow',
    optional: true,
    onPress: (navigation) => navigation.navigate('WalletConnectActiveSessions'),
  },
]

const PolygonIdList = [
  {
    label: 'Circuits',
    action: 'arrow',
    optional: true,
    onPress: (navigation) => navigation.navigate('PolygonIdCircuitsSettings'),
  },
]

export default (props) => {
  const { isVeridaTeamMember } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showLogout, setShowLogout] = useState(false)

  const networks = useSelector((state) => state.settings.networks)
  const modifiedGeneralList = [...generalList]
  const versionText = `${APP_NAME} ${capitalize(
    config.BITRISE_TRIGGERED_WORKFLOW_TITLE || config.DEPLOY_ENVIRONMENT
  )} ${APP_VERSION_FORMATTED}`

  if (!isEmpty(networks)) {
    const selectedNode = networks[0].nodes[networks[0].selected_node]
    modifiedGeneralList.unshift({
      label: 'Storage',
      action: 'arrow',
      optional: false,
      onPress: (navigation) => navigation.navigate('StorageNodes'),
      value: selectedNode.name,
    })
  }

  const logout = async () => {
    setShowLogout(true)
  }

  const list = isVeridaTeamMember ? teamList : publicList

  const mergedList = [
    ...list,
    {
      label: 'Log Out',
      text: style.logoutText,
      optional: true,
      onPress: () => logout(),
    },
    {
      label: 'Delete Account',
      text: style.logoutText,
      optional: true,
      onPress: (navigation) =>
        navigation.navigate('DeleteAccount', {
          onSelectAccount: props.route.params.onSelectAccount,
          onLogoutAccounts: props.route.params.onLogoutAccounts,
        }),
    },
  ]

  if (loading) return <LoadingView />

  return (
    <View style={style.container}>
      <NavigationHeader
        title='Settings'
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => props.navigation.goBack(),
        }}
      />
      <ScrollView>
        <View style={LayoutStyle.layout}>
          <Text style={style.title}>Security</Text>
          <View>
            <PropertyList list={mergedList} />
          </View>
          {Boolean(modifiedGeneralList.length) && (
            <>
              <Text style={style.title}>General</Text>
              <View>
                <PropertyList list={modifiedGeneralList} />
              </View>
            </>
          )}
          <Text style={style.title}>Blockchain</Text>
          <View>
            <PropertyList list={BlockchainList} />
          </View>
          <Text style={style.title}>Polygon ID</Text>
          <View>
            <PropertyList list={PolygonIdList} />
          </View>
          <Text style={style.versionText}>{versionText}</Text>
        </View>
        <AddAccountsModal
          visible={showLogout}
          onClose={() => {
            setShowLogout(false)
          }}
          showLogout
          onSelectAccount={props.route.params.onSelectAccount}
          onLogoutAccounts={props.route.params.onLogoutAccounts}
          setLoading={setLoading}
        />
      </ScrollView>
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontFamily: NUNITO_SANS_BOLD,
    color: BLACK_COLOR_OPACITY(0.6),
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 6,
  },
  logoutText: {
    color: ORANGE_COLOR,
  },
  versionText: {
    color: BLACK_COLOR,
    marginTop: 15,
  },
})

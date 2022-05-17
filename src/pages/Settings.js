import { capitalize, isEmpty } from 'lodash'
import { Icon } from 'native-base'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Config from 'react-native-config'
import { getBuildNumber, getVersion } from 'react-native-device-info'
import { useSelector } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import { useAuth } from 'hooks/useAuth'

import PropertyList from '../components/PropertyList'
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

const generalList = [
  {
    label: 'Network',
    action: 'arrow',
    optional: false,
    onPress: (navigation) => navigation.navigate('Networks'),
    value: 'Testnet',
  },
]

const WalletConnectList = [
  {
    label: 'Dapps',
    action: 'arrow',
    optional: true,
    onPress: (navigation) => navigation.navigate('WalletConnect'),
  },
]

export default (props) => {
  const { isVeridaTeamMember } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  const networks = useSelector((state) => state.networks)
  const modifiedGeneralList = [...generalList]
  const versionText = `Verida Vault ${capitalize(
    Config.DEPLOY_ENVIRONMENT === 'internal' ? Config.DEPLOY_ENVIRONMENT : ''
  )} v${getVersion()}(${getBuildNumber()})`

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
      onPress: (navigation) => logout(navigation),
    },
  ]

  return (
    <View>
      <NavigationHeader
        title='Settings'
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => props.navigation.goBack(),
        }}
      />
      <View style={LayoutStyle.layout}>
        <Text style={style.title}>Security</Text>
        <View>
          <PropertyList list={mergedList} />
        </View>
        <Text style={style.title}>General</Text>
        <View>
          <PropertyList list={modifiedGeneralList} />
        </View>
        <Text style={style.title}>Wallet Connect</Text>
        <View>
          <PropertyList list={WalletConnectList} />
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
      />
    </View>
  )
}

const style = StyleSheet.create({
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

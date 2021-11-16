import React, { useState, useEffect } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Icon } from 'native-base'

import Text from 'components/Text'
import PropertyList from '../components/PropertyList'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import LayoutStyle from '../styles/layouts'
import { BLACK_COLOR_OPACITY, ORANGE_COLOR } from '../constants/color'

import { NUNITO_SANS_BOLD } from '../constants/text'
import { useAuth } from 'hooks/useAuth'
import AccountManager from 'api/AccountManager'

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

const manageWalletOption = {
  label: 'Manage Wallets',
  action: 'arrow',
  optional: true,
  onPress: (navigation) => navigation.navigate('ManageWallets'),
}

const teamList = [manageWalletOption, ...publicList]

export default (props) => {
  const [isVeridaTeamMember, setVeridaTeamMember] = useState(false)

  useEffect(() => {
    const checkTeamMember = async () => {
      const IS_VERIDA_TEAM_MEMBER =
        await AccountManager.getInstance().checkIfVeridaTeamMember()
      setVeridaTeamMember(IS_VERIDA_TEAM_MEMBER)
    }

    checkTeamMember()
  })

  const { refresh } = useAuth()

  const logout = async () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to logout of all your accounts?',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await AccountManager.getInstance().logout()
            await refresh()
          },
        },
      ]
    )
  }

  const list = isVeridaTeamMember ? teamList : publicList

  const mergedList = [
    ...list,
    {
      label: 'Log Out',
      text: style.logoutText,
      optional: true,
      onPress: logout,
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
      </View>
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
})

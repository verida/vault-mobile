import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

import AppAlert from 'components/AppAlert/AppAlert'
import BadgeList from 'components/Badges/BadgeList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'

const veridaIdentityIcon = require('assets/badges_icon/verida_identity.png')
const facebookIcon = require('assets/badges_icon/facebook.png')

const CONNECTED_DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    connection: 'Verida Identity',
    status: true,
    username: '@cmcWebCode',
    icon: veridaIdentityIcon,
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb2',
    connection: 'Twitter Account',
    status: true,
    username: '@cmcWebCode',
    icon: veridaIdentityIcon,
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb',
    connection: 'Discord Account',
    status: true,
    username: '@cmcWebCode',
    icon: veridaIdentityIcon,
  },
]

const NOT_CONNECTED_DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28222',
    connection: 'Facebook',
    status: false,
    username: '',
    icon: facebookIcon,
  },
]


const ClaimBadges = () => {
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const onOpenInfoModal = () => {
    setInfoModalVisible(!infoModalVisible)
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader title='Claim Verida Badges' left={{ icon: 'back' }} />
      <View style={styles.content}>
        <Text style={styles.title}>Verida Badges</Text>
        <Text style={styles.bodyText}>
          Connect your social accounts to verify and claim your Verida Badges.
          They will appear on your Verida One profile and enable dApps to verify
          your identity.
        </Text>
        <AppAlert body={'What are Verida Badges?'} type='info' action={onOpenInfoModal} />
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Available Badges</Text>
          <BadgeList data={CONNECTED_DATA} />
        </View>
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Connect to get more Badges</Text>
          <BadgeList data={NOT_CONNECTED_DATA} />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default ClaimBadges

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE_COLOR,
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontWeight: '600',
    fontSize: 28,
    color: TEXT_COLOR,
    marginTop: 24,
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '400',
    fontSize: 14,
    marginBottom: 16,
  },
  listSection: {
    marginTop: 40,
  },
  listTitle: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontWeight: '700',
    fontSize: 17,
    color: TEXT_COLOR,
    marginBottom: 8,
  },
})

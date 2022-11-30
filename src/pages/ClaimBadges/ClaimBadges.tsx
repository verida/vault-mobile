import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

import AppAlert from 'components/AppAlert/AppAlert'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import BadgeList from '../../components/Badges/BadgeList'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from '../../constants/text'

const ClaimBadges = () => {
  const desc = `Verida Badge is a public and immutable token sent to your blockchain address. It will appear on your Verida One public profile by default.`
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <NavigationHeader title='Claim Verida Badges' left={{ icon: 'back' }} />
        <Text style={styles.title}>Verida Badges</Text>
        <Text style={styles.bodyText}>
          Connect your social accounts to verify and claim your Verida Badges.
          They will appear on your Verida One profile and enable dApps to verify
          your identity.
        </Text>
        <AppAlert body={desc} type='warning' />
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Available Badges</Text>
          <BadgeList />
        </View>
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Connect to get more Badges</Text>
          {/* <BadgeList /> */}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default ClaimBadges

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontWeight: '700',
    fontSize: 28,
    textAlign: 'justify',
    color: '#041133',
    marginTop: 24,
    marginBottom: 8,
  },
  bodyText: {
    fontWeight: '400',
    fontSize: 14,
    marginBottom: 16,
  },
  alertSection: {},
  listSection: {
    marginTop: 40,
  },
  listTitle: {
    fontFamily: NUNITO_SANS,
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'justify',
    color: '#041133',
    marginBottom: 8,
  },
})

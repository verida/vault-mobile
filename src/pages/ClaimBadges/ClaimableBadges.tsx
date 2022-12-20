import React, { useState } from 'react'
import { Linking, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import AppAlert from 'components/AppAlert/AppAlert'
import BadgeList from 'components/Badges/BadgeList'
import Button from 'components/Button'
import AppModal from 'components/modal/AppModal'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { VERIDA_DOCS_PAGE } from 'constants/url'
import { BadgeType } from 'utils/types/badges'

const DiscordIcon = require('assets/badges_icon/discord_badge_icon.png')
const veridaIdentityIcon = require('assets/badges_icon/verida_identity_badge_icon.png')
const facebookIcon = require('assets/badges_icon/facebook_badge_icon.png')
const TwitterIcon = require('assets/badges_icon/twitter_badge_icon.png')

export const badgeData: BadgeType[] = [
  {
    id: 'verida-identity',
    label: 'Verida Identity',
    name: '@cmcWebCode',
    description:
      'Your Badge will include your Verida DID as proof of ownership',
    image: veridaIdentityIcon,
  },
  {
    id: 'twitter-account',
    label: 'Twitter Account',
    name: '@cmcWebCode',
    description:
      'Your Badge will include your Twitter handle (username) as proof of ownership',
    image: TwitterIcon,
  },
  {
    id: 'discord-account',
    label: 'Twitter Account',
    name: '@cmcWebCode',
    description:
      'Your Badge will include your Twitter handle (username) as proof of ownership',
    image: DiscordIcon,
  },
]

const NOT_CONNECTED_DATA: BadgeType[] = [
  {
    id: 'facebook-account',
    label: 'Twitter Account',
    description:
      'Your Badge will include your Twitter handle (username) as proof of ownership',
    image: facebookIcon,
  },
]

const badgesDescription = `
  We defined the text now:

  Verida One is your web3 native public profile to showcase your web2 and web3 identities. It provides a single source of truth about activities and ownership that can be read by both humans (via a web UI) and programs (via methods including on-chain records and Verida APIs for off-chain data).

  Verida Badges represent a verified proof of ownership of a web2 platform account that you control. Verida badges are on-chain Soulbound Tokens which are a tokenised attestation of your ownership claim.

  You can mint Verida Badges from the Verida Vault and have them displayed on your public Verida One profile. By issuing verified Badges, Verida acts as a trusted authority recognised by users, communities and dapps.

  Soulbound Tokens (SBTs) are a new cryptographic primitive that attests and graphs reputational value in a native blockchain environment. SBTs are a kind of non-transferable asset, often referred to as a Non-Transferable NFT.

`

const ClaimableBadges: React.FC = () => {
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const onOpenInfoModal = () => {
    setInfoModalVisible(!infoModalVisible)
  }

  const handleLink = () => {
    Linking.openURL(VERIDA_DOCS_PAGE)
  }

  const appModalFooter = (
    <Button
      color='primary'
      onPress={handleLink}
      disabled={false}
      loading={false}>
      Read More
    </Button>
  )

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
        <View style={styles.alertContainer}>
          <AppAlert
            message={'What are Verida Badges?'}
            type='info'
            onPress={onOpenInfoModal}
          />
        </View>
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Available Badges</Text>
          <BadgeList data={badgeData} />
        </View>
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Connect to get more Badges</Text>
          <BadgeList data={NOT_CONNECTED_DATA} />
        </View>
      </View>
      <AppModal
        visible={infoModalVisible}
        onClose={onOpenInfoModal}
        title='What are Verida Badges ?'
        footer={appModalFooter}>
        <View style={styles.modalContent}>
          <Text style={styles.bodyText}>{badgesDescription}</Text>
        </View>
      </AppModal>
    </SafeAreaView>
  )
}

export default ClaimableBadges

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
  modalContent: {
    paddingHorizontal: 16,
  },
  bodyText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '400',
    fontSize: 14,
  },
  alertContainer: {
    marginTop: 16,
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

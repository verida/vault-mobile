import React, { useEffect, useState } from 'react'
import { Linking, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import { BadgeManager } from 'api/BadgeManager'
import AppAlert from 'components/AppAlert/AppAlert'
import BadgeList from 'components/Badges/BadgeList'
import Button from 'components/Button'
import AppModal from 'components/modal/AppModal'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { Headline } from 'components/Typography/Headline'
import { Paragraph } from 'components/Typography/Paragraph'
import { TEXT_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { VERIDA_ONE_FAQ_URL } from 'constants/url'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

const ClaimableBadges: React.FC = () => {
  const styles = useThemeAwareStyle(createStyles)
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [availableBadges, setAvailableBadges] = useState([])

  const handleWhatIsVeridaBadgesInfoPress = () => {
    setInfoModalVisible(true)
  }

  const handleWhatIsVeridaBadgesModalClose = () => {
    setInfoModalVisible(false)
  }

  const handleWhatIsVeridaBadgesReadMoreLinkPress = () => {
    Linking.openURL(VERIDA_ONE_FAQ_URL)
  }

  const whatIsVeridaBadgesModalFooter = (
    <Button
      color='primary'
      onPress={handleWhatIsVeridaBadgesReadMoreLinkPress}
      disabled={false}
      loading={false}>
      Read More
    </Button>
  )

  const init = async () => {
    const availableBadges = await BadgeManager.getAvailableBadges()
    // @todo: fix this TS error
    setAvailableBadges(availableBadges)
  }

  useEffect(() => {
    init()
  }, [])

  /** TODO: Add list of Connections supported by the Badges but where the user is not yet connected.
   * Create dedicated Connection list and Connection list item components
   */

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader title='Claim Verida Badges' left={{ icon: 'back' }} />
      <View style={styles.content}>
        <Headline style={styles.headline}>Verida Badges</Headline>
        <Paragraph style={styles.bodyText}>
          Connect your social accounts to verify and claim your Verida Badges.
          They will appear on your Verida One profile and enable dApps to verify
          your identity.
        </Paragraph>
        <View style={styles.alertContainer}>
          <AppAlert
            message={'What are Verida Badges?'}
            type='info'
            onPress={handleWhatIsVeridaBadgesInfoPress}
          />
        </View>
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Available Badges</Text>
          <BadgeList badges={availableBadges} />
        </View>
        {/* TODO: Add list of Connections */}
      </View>
      <AppModal
        visible={infoModalVisible}
        onClose={handleWhatIsVeridaBadgesModalClose}
        title='What are Verida Badges ?'
        footer={whatIsVeridaBadgesModalFooter}>
        <View style={styles.modalContent}>
          <Paragraph style={styles.bodyText}>
            Verida One is your web3 native public profile to showcase your web2
            and web3 identities. It provides a single source of truth about
            activities and ownership that can be read by both humans (via a web
            UI) and programs (via methods including on-chain records and Verida
            APIs for off-chain data). Verida Badges represent a verified proof
            of ownership of a web2 platform account that you control. Verida
            badges are on-chain Soulbound Tokens which are a tokenised
            attestation of your ownership claim. You can mint Verida Badges from
            the Verida Vault and have them displayed on your public Verida One
            profile. By issuing verified Badges, Verida acts as a trusted
            authority recognised by users, communities and dapps. Soulbound
            Tokens (SBTs) are a new cryptographic primitive that attests and
            graphs reputational value in a native blockchain environment. SBTs
            are a kind of non-transferable asset, often referred to as a
            Non-Transferable NFT.
          </Paragraph>
        </View>
      </AppModal>
    </SafeAreaView>
  )
}

export default ClaimableBadges

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    content: {
      paddingHorizontal: theme.spacing.m,
    },
    headline: {
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontWeight: '600',
      fontSize: 28,
      color: TEXT_COLOR,
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.s,
    },
    modalContent: {
      paddingHorizontal: theme.spacing.m,
    },
    bodyText: {
      fontFamily: NUNITO_SANS,
      fontWeight: '400',
      fontSize: theme.fontSize.m,
    },
    alertContainer: {
      marginTop: theme.spacing.m,
    },
    listSection: {
      marginTop: theme.spacing.xxl,
    },
    listTitle: {
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontWeight: '700',
      fontSize: 17,
      color: TEXT_COLOR,
      marginBottom: theme.spacing.s,
    },
  })
}

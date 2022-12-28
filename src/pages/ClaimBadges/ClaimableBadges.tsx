import React, { useState } from 'react'
import { Linking, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import AppAlert from 'components/AppAlert/AppAlert'
import BadgeList from 'components/Badges/BadgeList'
import Button from 'components/Button'
import AppModal from 'components/modal/AppModal'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { Headline } from 'components/Typography/Headline'
import { Paragraph } from 'components/Typography/Paragraph'
import { BADGES_DESCRIPTION } from 'constants/claimBadges'
import { TEXT_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { VERIDA_DOCS_PAGE } from 'constants/url'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'
import { BADGE_DATA } from 'utils/badges'

const ClaimableBadges: React.FC = () => {
  const styles = useThemeAwareStyle(createStyles)
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
            onPress={onOpenInfoModal}
          />
        </View>
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Available Badges</Text>
          <BadgeList data={BADGE_DATA} />
        </View>
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Connect to get more Badges</Text>
        </View>
      </View>
      <AppModal
        visible={infoModalVisible}
        onClose={onOpenInfoModal}
        title='What are Verida Badges ?'
        footer={appModalFooter}>
        <View style={styles.modalContent}>
          <Paragraph style={styles.bodyText}>{BADGES_DESCRIPTION}</Paragraph>
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

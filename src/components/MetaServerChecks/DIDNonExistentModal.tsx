import { useTheme } from 'contexts/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { Modal, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import AccountManager from 'api/AccountManager'
import Texture from 'assets/landing-bg.svg'
import Logo from 'assets/logo.svg'
import Button from 'components/Button'
import CopySeedPhraseModal from 'components/SeedPhraseModal/CopySeedPhraseModal'
import { Spacer } from 'components/Spacer'
import { Paragraph } from 'components/Typography/Paragraph'
import { Title } from 'components/Typography/Title'
import { BACKGROUND_RADIAN_COLORS } from 'constants/color'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

type Props = {
  dismissModal: () => void
  retry: () => void
}

const DIDNonExistentModal = ({ retry, dismissModal }: Props) => {
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const [showSeedPhraseModal, setShowSeedPhraseModal] = useState(false)

  return (
    <Modal animationType='fade' transparent visible>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={BACKGROUND_RADIAN_COLORS}
          style={styles.landing}>
          <Texture width={425} height={428} />
          <View style={styles.backgroundContainer}>
            <Logo width={139} height={51} />
          </View>
        </LinearGradient>
        <View style={styles.container}>
          <View style={styles.card}>
            <Title style={styles.title}>Account Connection Failed</Title>
            <Spacer vertical='m' />
            <View style={styles.hline} />
            <Spacer vertical='m' />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContainer}>
              <Paragraph>
                {`Something went wrong, could not connect to the account.`}
              </Paragraph>
            </ScrollView>
            <View style={styles.footer}>
              {Boolean(retry) && (
                <Button
                  color='primary'
                  onPress={() => {
                    dismissModal()
                    retry!()
                  }}>
                  Try again
                </Button>
              )}
              <Button
                color='grey'
                onPress={() => {
                  setShowSeedPhraseModal(true)
                }}>
                Backup seed phrase
              </Button>
              {Boolean(
                AccountManager.getInstance().getSelectedAccount()?.did
              ) && (
                <Button
                  color='grey'
                  textStyle={{ color: theme.color.orange }}
                  style={{ marginBottom: 0 }}
                  onPress={async () => {
                    dismissModal()
                    await AccountManager.getInstance().logout([
                      AccountManager.getInstance().getSelectedAccount()!.did!,
                    ])
                    retry!()
                  }}>
                  Log Out
                </Button>
              )}
            </View>
          </View>
        </View>

        <CopySeedPhraseModal
          visible={showSeedPhraseModal}
          phrase={AccountManager.getInstance().getSelectedAccount()!.mnemonic!}
          toggleConfirmModal={() => setShowSeedPhraseModal(false)}
        />
      </SafeAreaView>
    </Modal>
  )
}

export default DIDNonExistentModal

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: '10%',
      paddingVertical: '20%',
      backgroundColor: theme.color.overlay,
    },
    card: {
      backgroundColor: theme.color.surface,
      borderRadius: 20,
      width: '100%',
      minHeight: '60%',
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    scrollViewContainer: {
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.m,
    },
    title: {
      paddingHorizontal: theme.spacing.m,
      marginTop: theme.spacing.m,
    },
    hline: {
      height: StyleSheet.hairlineWidth,
      width: '100%',
      backgroundColor: theme.color.separator,
    },
    footer: {
      backgroundColor: theme.color.surface,
      width: '100%',
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
      padding: theme.spacing.m,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    landing: { ...StyleSheet.absoluteFillObject },
    backgroundContainer: {
      position: 'absolute',
      paddingHorizontal: 24,
      paddingVertical: 77,
      height: '100%',
      width: '100%',
      justifyContent: 'space-between',
    },
  })
}

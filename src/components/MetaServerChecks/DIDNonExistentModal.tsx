import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import AccountManager from '~/api/AccountManager'
import Texture from '~/assets/landing-bg.svg'
import Logo from '~/assets/logo.svg'
import Button from '~/components/Button'
import CopySeedPhraseModal from '~/components/SeedPhraseModal/CopySeedPhraseModal'
import { Spacer } from '~/components/Spacer'
import { Paragraph } from '~/components/Typography/Paragraph'
import { Text } from '~/components/Typography/Text'
import { Title } from '~/components/Typography/Title'
import {
  BACKGROUND_RADIAN_COLORS,
  BLACK_ORIGIN_COLOR,
  LIGHTGREY_COLOR,
} from '~/constants/color'
import { useTheme } from '~/contexts/ThemeContext'
import { useIdentities } from '~/features/identities'
import { Logger } from '~/features/telemetry'
import { emitter } from '~/helpers/emitter'
import { useAuth } from '~/hooks/useAuth'
import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { Theme } from '~/styles/types'

const logger = Logger.create('Component/DIDNonExistentModal')

type Props = {
  dismissModal: () => void
}

const isAcaciaTestnetDid = (did: string) => {
  return did.startsWith('did:vda:testnet')
}

// TODO: remove
const acaciaTestnetInfo = {
  title: 'Acacia Testnet has been shutdown',
  description:
    'The Acacia Testnet has been shutdown, This identity is no longer operational. You can remove it from your wallet.\n\n',
}

export const DIDNonExistentModal = ({ dismissModal }: Props) => {
  const [loading, setLoading] = useState(true)
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const [showSeedPhraseModal, setShowSeedPhraseModal] = useState(false)
  const { refresh: retry } = useAuth()
  const currentDID =
    AccountManager.getInstance().getSelectedAccount()?.did ?? ''

  const [pinCodeStatus, setPinCodeStatus] = useState(true)
  const [seedPhraseData, setSeedPhraseData] = useState('')
  const [isPinCorrect, setPinCorrectStatus] = useState(false)

  const { removeIdentity } = useIdentities()

  async function onLogoutAccount(did: string) {
    try {
      dismissModal()
      await removeIdentity(did)
    } catch (error) {
      logger.error(error)
    } finally {
      emitter.emit('APP_RECOVER_FROM_ERROR', undefined)
    }
  }

  useEffect(() => {
    const initUserPin = async () => {
      const status = await hasUserSetPinCode()
      setPinCodeStatus(status)
      setLoading(false)
    }

    initUserPin()

    const init = async () => {
      setSeedPhraseData(
        AccountManager.getInstance().getSelectedAccount()?.mnemonic ?? ''
      )
    }
    init()
  }, [])

  if (showSeedPhraseModal && pinCodeStatus && !isPinCorrect) {
    return (
      <Modal animationType='fade' visible>
        <PINCode
          status={'enter'}
          titleEnter={'Enter your PIN'}
          onClickButtonLockedPage={() => BackHandler.exitApp()}
          finishProcess={() => setPinCorrectStatus(true)}
          colorCircleButtons='#dfe1e8'
          stylePinCodeColorTitle={BLACK_ORIGIN_COLOR}
          stylePinCodeColorSubtitle={BLACK_ORIGIN_COLOR}
          stylePinCodeButtonNumber={BLACK_ORIGIN_COLOR}
          stylePinCodeDeleteButtonSize={45}
          stylePinCodeCircle={{ height: 10, width: 10, borderRadius: 5 }}
        />
      </Modal>
    )
  }

  return (
    <Modal animationType='fade' transparent visible>
      {loading && (
        <View style={styles.container}>
          <Text>Loading </Text>
          <ActivityIndicator size='large' />
        </View>
      )}
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={BACKGROUND_RADIAN_COLORS}
          style={styles.landing}>
          <Texture width={425} height={428} />
          <View style={styles.backgroundContainer}>
            <Logo width={156} height={52} />
          </View>
        </LinearGradient>
        <View style={styles.container}>
          <View style={styles.card}>
            <Title style={styles.title}>
              {isAcaciaTestnetDid(currentDID)
                ? acaciaTestnetInfo.title
                : `Identity Not Found`}
            </Title>
            <Spacer vertical='m' />
            <View style={styles.hline} />
            <Spacer vertical='m' />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContainer}>
              <Paragraph>
                {isAcaciaTestnetDid(currentDID)
                  ? acaciaTestnetInfo.description
                  : `This Identity is not available at the moment. This can be due to a Network or Blockchain issue. Please wait a moment.\nIf you think this Identity doesn't exist anymore, you can remove it from your Wallet.\nIdentities cannot be recovered without the Seed Phrase, please make a backup first.\n\n`}
                <Paragraph style={{ color: theme.color.primary }}>
                  {`${currentDID}`}
                </Paragraph>
              </Paragraph>
            </ScrollView>
            <View style={styles.footer}>
              {!isAcaciaTestnetDid(currentDID) && (
                <>
                  <Button
                    color='primary'
                    onPress={() => {
                      dismissModal()
                      retry()
                    }}>
                    Try Again
                  </Button>
                  <Button
                    color='grey'
                    onPress={() => {
                      setShowSeedPhraseModal(true)
                    }}>
                    Backup Seed Phrase
                  </Button>
                </>
              )}
              <Button
                color='warning'
                style={{
                  marginBottom: 0,
                  borderColor: LIGHTGREY_COLOR,
                }}
                onPress={async () => {
                  const otherDids = Object.keys(
                    AccountManager.getInstance().accounts
                  )?.filter((did) => did !== currentDID)
                  Alert.alert(
                    'Are you sure?',
                    `Remove Identity from Wallet: \n${currentDID}? ${
                      otherDids.length > 0
                        ? `\n\nSwitch to the next identity: \n${otherDids[0]}`
                        : ''
                    }`,
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => {
                          onLogoutAccount(currentDID!)
                        },
                      },
                    ]
                  )
                }}>
                Remove Identity from Wallet
              </Button>
            </View>
          </View>
        </View>

        <CopySeedPhraseModal
          visible={showSeedPhraseModal}
          phrase={seedPhraseData}
          toggleConfirmModal={() => setShowSeedPhraseModal(false)}
        />
      </SafeAreaView>
    </Modal>
  )
}

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

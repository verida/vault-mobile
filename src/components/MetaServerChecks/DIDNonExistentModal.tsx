import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import { useTheme } from 'contexts/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import { emitter } from 'helpers/emitter'
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
import { useDispatch } from 'react-redux'

import AccountManager from 'api/AccountManager'
import Texture from 'assets/landing-bg.svg'
import Logo from 'assets/logo.svg'
import Button from 'components/Button'
import CopySeedPhraseModal from 'components/SeedPhraseModal/CopySeedPhraseModal'
import { Spacer } from 'components/Spacer'
import { Paragraph } from 'components/Typography/Paragraph'
import { Text } from 'components/Typography/Text'
import { Title } from 'components/Typography/Title'
import {
  BACKGROUND_RADIAN_COLORS,
  BLACK_ORIGIN_COLOR,
  LIGHTGREY_COLOR,
} from 'constants/color'
import { useAuth } from 'hooks/useAuth'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { logout as logoutAction } from 'reduxStore/general/actions'
import { Theme } from 'styles/types'

type Props = {
  dismissModal: () => void
}

const DIDNonExistentModal = ({ dismissModal }: Props) => {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const [showSeedPhraseModal, setShowSeedPhraseModal] = useState(false)
  const { refresh: retry } = useAuth()

  const [pinCodeStatus, setPinCodeStatus] = useState(true)
  const [seedPhraseData, setSeedPhraseData] = useState('')
  const [isPinCorrect, setPinCorrectStatus] = useState(false)

  async function onLogoutAccounts(dids: string[]) {
    dismissModal()
    // Only flush Redux store if the current account is logged out
    if (
      dids.includes(
        AccountManager.getInstance().getSelectedAccount()?.did ?? ''
      )
    ) {
      dispatch(logoutAction())
    }
    await AccountManager.getInstance().logout(dids)
    emitter.emit('APP_RECOVER_FROM_ERROR', undefined)
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
            <Title style={styles.title}>Identity Not Found</Title>
            <Spacer vertical='m' />
            <View style={styles.hline} />
            <Spacer vertical='m' />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContainer}>
              <Paragraph>
                {`This identity no longer exists due to a network upgrade and will be removed from your Wallet\n\n`}
                <Paragraph style={{ color: theme.color.black800 }}>
                  {`Identity ${
                    AccountManager.getInstance().getSelectedAccount()?.did
                  }`}
                </Paragraph>
              </Paragraph>
            </ScrollView>
            <View style={styles.footer}>
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
              <Button
                color='warning'
                style={{
                  marginBottom: 0,
                  borderColor: LIGHTGREY_COLOR,
                }}
                onPress={async () => {
                  const currentDID =
                    AccountManager.getInstance().getSelectedAccount()?.did
                  const otherDids = Object.keys(
                    AccountManager.getInstance().accounts
                  )?.filter((did) => did !== currentDID)
                  Alert.alert(
                    'Are you sure?',
                    `Delete identity: \n${currentDID}? ${
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
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          onLogoutAccounts([currentDID!])
                        },
                      },
                    ]
                  )
                }}>
                Delete Identity
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

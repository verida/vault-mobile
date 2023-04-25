import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import { StackActions, useNavigation } from '@react-navigation/native'
import { useTheme } from 'contexts/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  InteractionManager,
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
import { BACKGROUND_RADIAN_COLORS, BLACK_ORIGIN_COLOR } from 'constants/color'
import { useAuth } from 'hooks/useAuth'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { AddIdentityMode } from 'pages/Account/Identity/Identity'
import AddAccountsModal from 'pages/Dashboard/AddAccountsModal'
import { logout as logoutAction } from 'reduxStore/general/actions'
import { Theme } from 'styles/types'

type Props = {
  dismissModal: () => void
  retry: (forcedInit?: boolean) => void
}

const DIDNonExistentModal = ({ retry, dismissModal }: Props) => {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const styles = useThemeAwareStyle(createStyles)
  const navigation = useNavigation()
  const { theme } = useTheme()
  const [showManageIdentitiesModal, setShowManageIdentitiesModal] =
    useState(false)
  const [showSeedPhraseModal, setShowSeedPhraseModal] = useState(false)
  const { switchToAccount, refresh } = useAuth()

  const [pinCodeStatus, setPinCodeStatus] = useState(true)
  const [seedPhraseData, setSeedPhraseData] = useState('')
  const [isPinCorrect, setPinCorrectStatus] = useState(false)

  function onAddAccount() {
    dismissModal()
    InteractionManager.runAfterInteractions(() => {
      navigation.dispatch(
        StackActions.replace('ManageIdentities', {
          screen: 'Identity',
          params: {
            mode: AddIdentityMode.Add,
            recoverFromError: true,
          },
        })
      )
    })
  }

  function onImportAccount() {
    dismissModal()
    setShowManageIdentitiesModal(false)

    InteractionManager.runAfterInteractions(() => {
      navigation.dispatch(
        StackActions.replace('ManageIdentities', {
          screen: 'SeedPhraseEntered',
          params: {
            recoverFromError: true,
          },
        })
      )
    })
  }

  async function onSelectAccount(did: string) {
    const currentDid = AccountManager.getInstance().getSelectedAccount()?.did
    if (did === currentDid) {
      return
    }

    dismissModal()
    retry(false)
    setShowManageIdentitiesModal(false)
    try {
      await switchToAccount(did)
    } catch (e) {
      Alert.alert(
        'Error',
        `Unable to switch to that account, please try again later.`
      )

      // Switch back to the current account
      await switchToAccount(currentDid!)
    } finally {
      await refresh()
    }
  }

  async function onLogoutAccounts(dids: string[]) {
    dismissModal()
    retry(false)
    setShowManageIdentitiesModal(false)

    // Only flush Redux store if the current account is logged out
    if (
      dids.includes(
        AccountManager.getInstance().getSelectedAccount()?.did ?? ''
      )
    ) {
      dispatch(logoutAction())
    }
    await AccountManager.getInstance().logout(dids)
    retry(true)
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
            <Logo width={139} height={51} />
          </View>
        </LinearGradient>
        <View style={styles.container}>
          <View style={styles.card}>
            <Title style={styles.title}>Identity Unavailable</Title>
            <Spacer vertical='m' />
            <View style={styles.hline} />
            <Spacer vertical='m' />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContainer}>
              <Paragraph>
                {`We are not able to find this Identity at the moment. You may have deleted it, or we may not be able to connect to the decentralised network.\n\n`}
                <Paragraph style={{ color: theme.color.black800 }}>
                  {`Identity ${
                    AccountManager.getInstance().getSelectedAccount()?.did
                  }`}
                </Paragraph>
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
                  Try Again
                </Button>
              )}
              <Button
                color='grey'
                onPress={() => {
                  setShowSeedPhraseModal(true)
                }}>
                Backup Seed Phrase
              </Button>
              <Button
                color='grey'
                style={{ marginBottom: 0 }}
                onPress={async () => {
                  setShowManageIdentitiesModal(true)
                }}>
                Manage Identities
              </Button>
            </View>
          </View>
        </View>

        <CopySeedPhraseModal
          visible={showSeedPhraseModal}
          phrase={seedPhraseData}
          toggleConfirmModal={() => setShowSeedPhraseModal(false)}
        />

        <AddAccountsModal
          visible={showManageIdentitiesModal}
          onClose={() => setShowManageIdentitiesModal(false)}
          onAddNew={onAddAccount}
          onImport={onImportAccount}
          onSelectAccount={onSelectAccount}
          onLogoutAccounts={onLogoutAccounts}
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

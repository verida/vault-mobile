import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import {
  updateCryptoWallet,
  UpdateCryptoWalletData,
  useCryptoWallets,
} from 'features/cryptoWallet'
import React, { useCallback, useEffect, useState } from 'react'
import { BackHandler, StyleSheet, TouchableOpacity, View } from 'react-native'

import { Icon } from '~/components'
import { useTheme } from '~/contexts'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import ExportSeedphraseSvg from 'assets/export_seedphrase.svg'
import { ChainAddressesList } from 'components/ChainsAddressesList'
import Container from 'components/Container'
import CopySeedPhraseModal from 'components/SeedPhraseModal/CopySeedPhraseModal'
import SeedPhraseWarningModal from 'components/SeedPhraseModal/SeedPhraseWarningModal'
import Text from 'components/Text'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { MainStackScreenProps } from 'navigation/types'
import { useAppDispatch } from 'reduxStore/types'

import PrivateKeyModal from './PrivateKeyModal'
import RenameWalletModal from './RenameWalletModal'

export type SingleWalletScreenParams = {
  walletId: string
}

type SingleWalletScreenProps = MainStackScreenProps<'SingleWallet'>

export const SingleWalletScreen: React.FC<SingleWalletScreenProps> = (
  props
) => {
  const { navigation, route } = props
  const { walletId } = route.params

  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)
  const [renameModalVisible, setRenameModalVisible] = useState(false)
  const [copySeedPhraseModalVisible, toggleCopySeedPhraseModal] =
    useState(false)
  const [copyPrivateKeyModalVisible, toggleCopyPrivateKeyModal] =
    useState(false)
  const [seedPhraseModalVisible, setSeedPhraseModalVisible] = useState(false)
  const [seedPhraseData, setSeedPhraseData] = useState('')
  const [privateKeyData, setPrivateKeyData] = useState('')
  const [pinCodeStatus, setPinCodeStatus] = useState(true)
  const [isPinCorrect, setPinCorrectStatus] = useState(false)

  const cryptoWallets = useCryptoWallets()
  const cryptoWallet = cryptoWallets.find((wallet) => wallet.id === walletId)

  const handleRenameWallet = useCallback(
    async (id: string, data: UpdateCryptoWalletData) => {
      setLoading(true)
      await dispatch(
        updateCryptoWallet({
          walletId: id,
          data,
        })
      )
      setLoading(false)
    },
    [dispatch]
  )

  const handleEditButtonPress = useCallback(() => {
    setRenameModalVisible(true)
  }, [])

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  useEffect(() => {
    navigation.setOptions({
      title: cryptoWallet?.label || 'Loading...',
      headerShown: !(pinCodeStatus && !isPinCorrect),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleEditButtonPress}
          style={styles.headerEditButton}>
          <Icon name='edit' size={24} color={theme.color.primary} />
        </TouchableOpacity>
      ),
    })
  }, [
    navigation,
    cryptoWallet?.label,
    pinCodeStatus,
    isPinCorrect,
    handleEditButtonPress,
    styles.headerEditButton,
    theme.color.primary,
  ])

  useEffect(() => {
    const initUserPin = async () => {
      const status = await hasUserSetPinCode()
      setPinCodeStatus(status)
      setLoading(false)
    }

    initUserPin()
  }, [])

  const showSeedPhrase = (data: any) => {
    setSeedPhraseModalVisible(false)
    setSeedPhraseData(data)
    toggleCopySeedPhraseModal(true)
  }

  const showPrivateKey = (data: any) => {
    setPrivateKeyData(data)
    toggleCopyPrivateKeyModal(true)
  }

  if (pinCodeStatus && !isPinCorrect) {
    return (
      <PINCode
        status={'enter'}
        titleEnter={'Enter your  PIN'}
        onClickButtonLockedPage={() => BackHandler.exitApp()}
        finishProcess={() => setPinCorrectStatus(true)}
        colorCircleButtons='#dfe1e8'
        stylePinCodeColorTitle={theme.color.black}
        stylePinCodeColorSubtitle={theme.color.black}
        stylePinCodeButtonNumber={theme.color.black}
        stylePinCodeDeleteButtonSize={45}
        stylePinCodeCircle={{ height: 10, width: 10, borderRadius: 5 }}
      />
    )
  }

  return (
    <Container withLoadingView showLoading={loading}>
      {cryptoWallet ? (
        <>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => setSeedPhraseModalVisible(true)}
              style={styles.actionButton}>
              <ExportSeedphraseSvg />
              <Text style={styles.actionButtonText}>Seed phrase</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.listLabel}>Accounts</Text>
          <ChainAddressesList
            list={cryptoWallet.accounts || []}
            onPressPrivateKey={(privateKey: string) => {
              showPrivateKey(privateKey)
            }}
          />
          <RenameWalletModal
            hideModal={() => setRenameModalVisible(false)}
            visible={renameModalVisible}
            onPressRename={handleRenameWallet as any}
            data={{ id: cryptoWallet.id, label: cryptoWallet.label }}
          />
          <SeedPhraseWarningModal
            hideModal={() => setSeedPhraseModalVisible(false)}
            visible={seedPhraseModalVisible}
            type='seed_phrase'
            onPressButton={() => showSeedPhrase(cryptoWallet.mnemonic)}
          />
          <CopySeedPhraseModal
            visible={copySeedPhraseModalVisible}
            phrase={seedPhraseData}
            toggleConfirmModal={() =>
              toggleCopySeedPhraseModal(!copySeedPhraseModalVisible)
            }
          />
          <PrivateKeyModal
            visible={copyPrivateKeyModalVisible}
            phrase={privateKeyData}
            toggleConfirmModal={() =>
              toggleCopyPrivateKeyModal(!copyPrivateKeyModalVisible)
            }
          />
        </>
      ) : (
        <Text
        // TODO: Add proper styling
        >
          Wallet not found
        </Text>
      )}
    </Container>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    walletHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 15,
    },
    backIcon: {
      color: '#000',
    },
    walletNameLogo: {
      paddingTop: 20,
      alignItems: 'center',
    },
    headerEditButton: {
      marginRight: theme.spacing.m,
    },
    // editButtonWrapper: {
    //   width: 40,
    // },
    // editButton: {
    //   color: '#423BCE',
    //   fontSize: 17,
    //   fontFamily: NUNITO_SANS_BOLD,
    //   marginTop: 4,
    // },
    title: {
      marginTop: 15,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontSize: 22,
    },
    listLabel: {
      textTransform: 'uppercase',
      color: 'rgba(4, 17, 51, 0.6)',
      marginHorizontal: 20,
      marginBottom: 10,
      marginTop: 30,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: 20,
    },
    actionButton: {
      alignItems: 'center',
    },
    actionButtonText: {
      marginTop: 5,
      fontSize: 14,
    },
  })

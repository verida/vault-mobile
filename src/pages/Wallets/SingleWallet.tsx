import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import Clipboard from '@react-native-community/clipboard'
import { BlockchainAccount } from 'features/blockchain'
import { getWalletObjectById, renameWallet } from 'features/cryptoWallet'
import { Icon } from 'native-base'
import React, { useEffect, useState } from 'react'
import { BackHandler, StyleSheet, TouchableOpacity, View } from 'react-native'

import CopyIcon from 'assets/copy_icon_dark.svg'
import ExportSeedphraseSvg from 'assets/export_seedphrase.svg'
import ChainsAddressesList from 'components/ChainsAddressesList'
import Container from 'components/Container'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import CopySeedPhraseModal from 'components/SeedPhraseModal/CopySeedPhraseModal'
import SeedPhraseWarningModal from 'components/SeedPhraseModal/SeedPhraseWarningModal'
import Text from 'components/Text'
import { BLACK_ORIGIN_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { MainStackScreenProps } from 'navigation/types'
import { useAppDispatch, useAppSelector } from 'reduxStore/types'

import PrivateKeyModal from './PrivateKeyModal'
import RenameWalletModal from './RenameWalletModal'

type SingleWalletScreenProps = MainStackScreenProps<'SingleWallet'>

const SingleWallet = (props: SingleWalletScreenProps) => {
  const { navigation, route } = props
  const { item } = route.params
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
  const wallets = useAppSelector((state) =>
    getWalletObjectById(state, item._id)
  )

  const onRenameWallet = async (walletId: string, data: { name: string }) => {
    setLoading(true)
    await dispatch(renameWallet({ walletId, data }))
    setLoading(false)
  }
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

  // @todo
  const singleWallet: BlockchainAccount | undefined =
    undefined as unknown as BlockchainAccount

  const isChainTypeEvm = singleWallet
    ? Object.keys(wallets.accounts)[0] === 'evm'
    : null

  if (pinCodeStatus && !isPinCorrect) {
    return (
      <PINCode
        status={'enter'}
        titleEnter={'Enter your  PIN'}
        onClickButtonLockedPage={() => BackHandler.exitApp()}
        finishProcess={() => setPinCorrectStatus(true)}
        colorCircleButtons='#dfe1e8'
        stylePinCodeColorTitle={BLACK_ORIGIN_COLOR}
        stylePinCodeColorSubtitle={BLACK_ORIGIN_COLOR}
        stylePinCodeButtonNumber={BLACK_ORIGIN_COLOR}
        stylePinCodeDeleteButtonSize={45}
        stylePinCodeCircle={{ height: 10, width: 10, borderRadius: 5 }}
      />
    )
  }

  return (
    <Container withLoadingView showLoading={loading}>
      <NavigationHeader
        title={wallets.label}
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        rightComponent={
          <View style={styles.editButtonWrapper}>
            <TouchableOpacity onPress={() => setRenameModalVisible(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <View style={styles.actionButtons}>
        {singleWallet ? (
          <>
            {singleWallet.address && (
              <TouchableOpacity
                onPress={() => Clipboard.setString(singleWallet.address!)}
                style={styles.actionButton}>
                <CopyIcon />
                <Text style={styles.actionButtonText}>Copy address</Text>
              </TouchableOpacity>
            )}
            {singleWallet.mnemonic && (
              <TouchableOpacity
                onPress={() => showSeedPhrase(singleWallet.mnemonic)}
                style={styles.actionButton}>
                <ExportSeedphraseSvg />
                <Text style={styles.actionButtonText}>Seed phrase</Text>
              </TouchableOpacity>
            )}
            {isChainTypeEvm && singleWallet.privateKey && (
              <TouchableOpacity
                onPress={() => showPrivateKey(singleWallet.privateKey)}
                style={styles.actionButton}>
                <ExportSeedphraseSvg />
                <Text style={styles.actionButtonText}>Private key</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity
            onPress={() => setSeedPhraseModalVisible(true)}
            style={styles.actionButton}>
            <ExportSeedphraseSvg />
            <Text style={styles.actionButtonText}>Seed phrase</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.listLabel}>Addresses</Text>
      <ChainsAddressesList
        list={Object.values(wallets.accounts)}
        singleWallet={singleWallet}
        onPressSeedPhrase={(seedPhrase: string) => {
          showSeedPhrase(seedPhrase)
        }}
        onPressPrivateKey={(privateKey: string) => {
          showPrivateKey(privateKey)
        }}
      />
      <RenameWalletModal
        hideModal={() => setRenameModalVisible(false)}
        visible={renameModalVisible}
        onPressRename={onRenameWallet as any}
        data={{ id: wallets._id, label: wallets.label }}
      />
      <SeedPhraseWarningModal
        hideModal={() => setSeedPhraseModalVisible(false)}
        visible={seedPhraseModalVisible}
        type='seed_phrase'
        onPressButton={() => showSeedPhrase(wallets.mnemonic)}
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
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  backIcon: { color: '#000' },
  walletNameLogo: { paddingTop: 20, alignItems: 'center' },
  editButtonWrapper: {
    width: 40,
  },
  editButton: {
    color: '#423BCE',
    fontSize: 17,
    fontFamily: NUNITO_SANS_BOLD,
    marginTop: 4,
  },
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
  actionButtonText: { marginTop: 5, fontSize: 14 },
})

export default SingleWallet

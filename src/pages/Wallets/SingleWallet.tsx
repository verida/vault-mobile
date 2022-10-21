import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import Clipboard from '@react-native-community/clipboard'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Container, Icon } from 'native-base'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import CopyIcon from 'assets/copy_icon_dark.svg'
import ExportSeedphraseSvg from 'assets/export_seedphrase.svg'
import ChainsAddressesList from 'components/ChainsAddressesList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import CopySeedPhraseModal from 'components/SeedPhraseModal/CopySeedPhraseModal'
import SeedPhraseWarningModal from 'components/SeedPhraseModal/SeedPhraseWarningModal'
import Text from 'components/Text'
import { BLACK_ORIGIN_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { MainStackParams } from 'navigation/types'
import { selectChains } from 'reduxStore/tokens/selectors'
import { renameWallet } from 'reduxStore/wallet/actions'
import { getWalletObjectById } from 'reduxStore/wallet/selectors'

import { AccountsType, WalletType } from './ManageWallets'
import PrivateKeyModal from './PrivateKeyModal'
import RenameWalletModal from './RenameWalletModal'

type Props = {
  wallets: WalletType
  navigation: NativeStackNavigationProp<MainStackParams>
  onRenameWallet: (selectedWalletID: string) => void
  chains: any
}

const SingleWallet = (props: Props) => {
  const { navigation, wallets, onRenameWallet, chains } = props
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

  useEffect(() => {
    const initUSerPin = async () => {
      const status = await hasUserSetPinCode()
      setPinCodeStatus(status)
      setLoading(false)
    }

    initUSerPin()
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

  const singleWallet: any =
    wallets.type === 'single' ? Object.values(wallets.accounts)[0] : null
  const isChainTypeEvm = singleWallet
    ? Object.keys(wallets.accounts)[0] === 'eip155'
    : null

  const addressList = Object.values(chains)
    .filter((chain: any) =>
      wallets.type === 'single' ? wallets.chain === chain.chainName : true
    )
    .map((chain: any) => {
      const wallet: AccountsType = wallets.accounts[chain.addressMapping]

      return {
        name: chain?.name,
        address: wallet.address,
        icon: chain?.icon,
        seedPhrase: wallet.mnemonic,
        privateKey: wallet.privateKey,
        addressMapping: chain.addressMapping,
      }
    })

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading </Text>
        <ActivityIndicator size='large' />
      </View>
    )
  }

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
    <Container>
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
                onPress={() => Clipboard.setString(singleWallet.address)}
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
        list={addressList}
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
        data={{ id: wallets.id, label: wallets.label }}
      />
      <SeedPhraseWarningModal
        hideModal={() => setSeedPhraseModalVisible(false)}
        visible={seedPhraseModalVisible}
        type='seed_phrase'
        onPressButton={() => showSeedPhrase(wallets.seedPhrase)}
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

const mapStateToProps = (rootState: any, props: any) => {
  const state = rootState.main
  return {
    wallets: getWalletObjectById(state, props.route.params.item.id),
    chains: selectChains(rootState),
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onRenameWallet: (walletId: string, args: any) =>
      dispatch(renameWallet(walletId, args) as any),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleWallet as any)

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Container, Icon } from 'native-base'
import React, { useState } from 'react'
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import ExportSeedphraseSvg from 'assets/export_seedphrase.svg'
import OtherSvg from 'assets/wallets/Other.svg'
import ChainsAddressesList from 'components/ChainsAddressesList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { MainStackParams } from 'navigation/types'
import { selectChains } from 'reduxStore/tokens/selectors'
import { renameWallet } from 'reduxStore/wallet/actions'
import { getAddressesForWallet } from 'reduxStore/wallet/selectors'

import { AccountsType, WalletType } from './ManageWallets'
import PrivateKeyModal from './PrivateKeyModal'
import RenameWalletModal from './RenameWalletModal'
import SeedPhraseModal from './SeedPhraseModal'
import WarningModal from './WarningModal'

type Props = {
  wallets: WalletType
  navigation: NativeStackNavigationProp<MainStackParams>
  onRenameWallet: (selectedWalletID: string) => void
  chains: any
}

const SingleWallet = (props: Props) => {
  const { navigation, wallets, onRenameWallet, chains } = props
  const [renameModalVisible, setRenameModalVisible] = useState(false)
  const [copySeedPhraseModalVisible, toggleCopySeedPhraseModal] =
    useState(false)
  const [copyPrivateKeyModalVisible, toggleCopyPrivateKeyModal] =
    useState(false)
  const [seedPhraseModalVisible, setSeedPhraseModalVisible] = useState(false)
  const [seedPhraseData, setSeedPhraseData] = useState('')
  const [privateKeyData, setPrivateKeyData] = useState('')

  const showSeedPhrase = (data: any) => {
    setSeedPhraseModalVisible(false)
    setSeedPhraseData(data)
    toggleCopySeedPhraseModal(true)
  }
  const showPrivateKey = (data: any) => {
    setPrivateKeyData(data)
    toggleCopyPrivateKeyModal(true)
  }

  const addressList = Object.values(chains).map((chain: any) => {
    const wallet: AccountsType = wallets.accounts[chain.addressMap]

    return {
      name: chain?.name,
      address: wallet.address,
      icon: chain?.icon,
      seedPhrase: wallet.mnemonic,
      privateKey: wallet.privateKey,
    }
  })

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
        <TouchableOpacity
          onPress={() => setSeedPhraseModalVisible(true)}
          style={styles.actionButton}>
          <ExportSeedphraseSvg />
          <Text style={styles.actionButtonText}>Seed phrase</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.listLabel}>Addresses</Text>
      <ChainsAddressesList
        list={addressList}
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
      <WarningModal
        hideModal={() => setSeedPhraseModalVisible(false)}
        visible={seedPhraseModalVisible}
        type='seed_phrase'
        onPressButton={() => showSeedPhrase(wallets.seedPhrase)}
      />
      <SeedPhraseModal
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
    wallets: getAddressesForWallet(state, props.route.params.item.id),
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

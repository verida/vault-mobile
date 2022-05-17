import { Icon } from 'native-base'
import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { getNativeForChain } from 'wallet/helpers/tokens'

import ExportSeedphraseSvg from 'assets/export_seedphrase.svg'
import OtherSvg from 'assets/wallets/Other.svg'
import ChainsAddressesList from 'components/ChainsAddressesList'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { getAddressesForWallet } from 'reduxStore/wallet/selectors'

import PrivateKeyModal from './PrivateKeyModal'
import SeedPhraseModal from './SeedPhraseModal'
import WarningModal from './WarningModal'

const SingleWallet = ({ navigation, wallets }) => {
  const [copySeedPhraseModalVisible, toggleCopySeedPhraseModal] =
    useState(false)
  const [copyPrivateKeyModalVisible, toggleCopyPrivateKeyModal] =
    useState(false)
  const [seedPhraseModalVisible, setSeedPhraseModalVisible] = useState(false)
  const [seedPhraseData, setSeedPhraseData] = useState('')
  const [privateKeyData, setPrivateKeyData] = useState('')

  const showSeedPhrase = (data) => {
    setSeedPhraseModalVisible(false)
    setSeedPhraseData(data)
    toggleCopySeedPhraseModal(true)
  }
  const showPrivateKey = (data) => {
    setPrivateKeyData(data)
    toggleCopyPrivateKeyModal(true)
  }

  const addressList = Object.keys(wallets.accounts).map((item) => {
    const itemData = wallets.accounts[item]
    const chainMapping = {
      algo: 'algorand',
      ethr: 'eip155',
      near: 'near',
    }
    const token = getNativeForChain(chainMapping[item])

    return {
      name: token.name,
      address: itemData.address,
      icon: token.icon,
      seedPhrase: itemData.mnemonic,
      privateKey: itemData.privateKey,
    }
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.walletHeader}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack()
          }}>
          <Icon name='arrow-back' style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.walletNameLogo}>
          <OtherSvg width={64} height={64} />
          <Text style={styles.title}>Multichain Wallet</Text>
        </View>
        <View style={styles.editButtonWrapper}>
          {/* <TouchableOpacity onPress={() => setRenameModalVisible(true)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity> */}
        </View>
      </View>
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
        onPressSeedPhrase={(seedPhrase) => {
          showSeedPhrase(seedPhrase)
        }}
        onPressPrivateKey={(privateKey) => {
          showPrivateKey(privateKey)
        }}
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
    </SafeAreaView>
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

const mapStateToProps = (rootState, props) => {
  const state = rootState.main
  return {
    wallets: getAddressesForWallet(state, props.route.params.item.id),
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleWallet)

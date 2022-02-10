import { Icon } from 'native-base'
import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'

import Text from 'components/Text'

import AddAddressSvg from '../../assets/add_address.svg'
import ExportSeedphraseSvg from '../../assets/export_seedphrase.svg'
import RemoveWalletSvg from '../../assets/remove_wallet.svg'
import NearSvg from '../../assets/wallets/Near.svg'
import AddressesList from '../../components/AddressesList'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import AddAddressModal from './AddAddressModal'
import EditAddressModal from './EditAddressModal'
import PrivateKeyModal from './PrivateKeyModal'
import RenameWalletModal from './RenameWalletModal'
import SeedPhraseModal from './SeedPhraseModal'
import WarningModal from './WarningModal'

const list = [
  {
    name: 'Friendly address name',
    address: '3hs73j...x7dn',
    onPress: () => {
      console.log()
    },
  },
  {
    name: 'Friendly address name',
    address: '3hs73j...x7dn',
    onPress: () => {
      console.log()
    },
  },
  {
    name: 'Friendly address name',
    address: '3hs73j...x7dn',
    onPress: () => {
      console.log()
    },
  },
  {
    name: 'Friendly address name',
    address: '3hs73j...x7dn',
    onPress: () => {
      console.log()
    },
  },
  {
    name: 'Friendly address name',
    address: '3hs73j...x7dn',
    onPress: () => {
      console.log()
    },
  },
]

export default ({ navigation }) => {
  const [renameModalVisible, setRenameModalVisible] = useState(false)
  const [privateKeyModalVisible, setPrivateKeyModalVisible] = useState(false)
  const [seedPhraseModalVisible, setSeedPhraseModalVisible] = useState(false)
  const [copySeedPhraseModalVisible, toggleCopySeedPhraseModal] =
    useState(false)
  const [copyPrivateKeyModalVisible, toggleCopyPrivateKeyModal] =
    useState(false)
  const showSeedPhrase = () => {
    setSeedPhraseModalVisible(false)
    toggleCopySeedPhraseModal(true)
  }
  const showPrivateKey = () => {
    setPrivateKeyModalVisible(false)
    toggleCopyPrivateKeyModal(true)
  }
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)

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
          <NearSvg width={64} height={64} />
          <Text style={styles.title}>NEAR</Text>
        </View>
        <TouchableOpacity onPress={() => setRenameModalVisible(true)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          style={styles.actionButton}>
          <AddAddressSvg />
          <Text style={styles.actionButtonText}>Add address</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSeedPhraseModalVisible(true)}
          style={styles.actionButton}>
          <ExportSeedphraseSvg />
          <Text style={styles.actionButtonText}>Seed phrase</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPrivateKeyModalVisible(true)}
          style={styles.actionButton}>
          <RemoveWalletSvg />
          <Text style={styles.actionButtonText}>Remove wallet</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.listLabel}>Addresses</Text>
      <AddressesList
        list={list}
        editButtonAction={() => setEditModalVisible(true)}
      />
      <RenameWalletModal
        hideModal={() => setRenameModalVisible(false)}
        visible={renameModalVisible}
      />
      <WarningModal
        hideModal={() => setSeedPhraseModalVisible(false)}
        visible={seedPhraseModalVisible}
        type='seed_phrase'
        onPressButton={() => showSeedPhrase()}
      />
      <WarningModal
        hideModal={() => setPrivateKeyModalVisible(false)}
        visible={privateKeyModalVisible}
        type='private_key'
        onPressButton={() => showPrivateKey()}
      />
      <SeedPhraseModal
        visible={copySeedPhraseModalVisible}
        toggleConfirmModal={() =>
          toggleCopySeedPhraseModal(!copySeedPhraseModalVisible)
        }
      />
      <PrivateKeyModal
        visible={copyPrivateKeyModalVisible}
        toggleConfirmModal={() =>
          toggleCopyPrivateKeyModal(!copyPrivateKeyModalVisible)
        }
      />
      <EditAddressModal
        hideModal={() => setEditModalVisible(false)}
        visible={editModalVisible}
      />
      <AddAddressModal
        hideModal={() => setAddModalVisible(false)}
        visible={addModalVisible}
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
  walletNameLogo: { paddingTop: 20 },
  editButton: {
    color: '#423BCE',
    fontSize: 17,
    fontFamily: NUNITO_SANS_BOLD,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  title: {
    marginTop: 15,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 22,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: { marginTop: 5, fontSize: 14 },
  listLabel: {
    textTransform: 'uppercase',
    color: 'rgba(4, 17, 51, 0.6)',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 30,
  },
})

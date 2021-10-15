import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { Icon } from 'native-base'

import AddressesList from '../../components/AddressesList'
import Text from 'components/Text'
import RenameWalletModal from './RenameWalletModal'
import WarningModal from './WarningModal'
import SeedPhraseModal from './SeedPhraseModal'
import PrivateKeyModal from './PrivateKeyModal'
import EditAddressModal from './EditAddressModal'
import AddAddressModal from './AddAddressModal'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'

import OtherSvg from '../../assets/other_addresses.svg'
import AddAddressSvg from '../../assets/add_address.svg'
import ExportSeedphraseSvg from '../../assets/export_seedphrase.svg'
import RemoveWalletSvg from '../../assets/remove_wallet.svg'

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
          <OtherSvg width={64} height={64} />
          <Text style={styles.title}>Other addresses</Text>
        </View>
        <TouchableOpacity onPress={() => setRenameModalVisible(true)}>
          <Icon name='add' style={styles.addIcon} />
        </TouchableOpacity>
      </View>
      <AddressesList list={list} />
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
  addIcon: { color: '#423BCE' },
  walletNameLogo: { paddingTop: 20, alignItems: 'center' },
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
    marginBottom: 25,
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

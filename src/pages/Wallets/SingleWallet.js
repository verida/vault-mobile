import React, { useEffect, useState } from 'react'
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { Container, Content, List, Icon, Left, Header } from 'native-base'
import { useActionSheet } from '@expo/react-native-action-sheet'

import AddressesList from '../../components/AddressesList'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Layout from 'components/Layouts/Layout'
import Label from 'components/Label'
import Text from 'components/Text'

import InputStyles from 'styles/inputs'
import DropDownPicker from 'components/Select'
import Button from 'components/Button'

import { SNOW_COLOR } from '../../constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'

import EthereumSvg from '../../assets/wallets/Ethereum.svg'
import AlgorandSvg from '../../assets/wallets/Algorand.svg'
import IKIGAISvg from '../../assets/wallets/IKIGAI.svg'
import NearSvg from '../../assets/wallets/Near.svg'
import OtherSvg from '../../assets/wallets/Other.svg'

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
  useEffect(() => {
    const init = async () => {
      console.log('init')
    }

    init()
  }, [])
  const [loading, setLoading] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [phrase, setPhrase] = useState('')
  const [blockchain, setBlockchain] = useState(null)
  const [processing, setProcessing] = useState(false)
  const { showActionSheetWithOptions } = useActionSheet()

  const onBlockchainChange = (option) => setBlockchain(option)
  const onAddWallet = async () => {
    try {
      setProcessing(true)
      setTimeout(() => {
        setAddModalVisible(false)
        setProcessing(false)
        navigation.navigate('SuccessFailure', {
          failure: name === '' ? true : false,
        })
      }, 2000)
    } catch (error) {
      setProcessing(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 15,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack()
          }}>
          <Icon name='arrow-back' style={{ color: '#000' }} />
        </TouchableOpacity>
        <View style={{ paddingTop: 20 }}>
          <NearSvg width={64} height={64} />
          <Text style={styles.title}>NEAR</Text>
        </View>
        <TouchableOpacity>
          <Text
            style={{
              color: '#423BCE',
              fontSize: 17,
              fontFamily: NUNITO_SANS_BOLD,
              marginTop: 4,
            }}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginTop: 20,
        }}>
        <TouchableOpacity style={styles.actionButton}>
          <AddAddressSvg />
          <Text style={styles.actionButtonText}>Add address</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <ExportSeedphraseSvg />
          <Text style={styles.actionButtonText}>Seed phrase</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <RemoveWalletSvg />
          <Text style={styles.actionButtonText}>Remove wallet</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.listLabel}>Addresses</Text>
      <AddressesList list={list} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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

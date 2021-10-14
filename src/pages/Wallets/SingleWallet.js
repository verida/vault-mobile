import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { Icon } from 'native-base'
import { useActionSheet } from '@expo/react-native-action-sheet'

import AddressesList from '../../components/AddressesList'
import Text from 'components/Text'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'

import NearSvg from '../../assets/wallets/Near.svg'

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

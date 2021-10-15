import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { Icon } from 'native-base'

import AddressesList from '../../components/AddressesList'
import Text from 'components/Text'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'

import OtherSvg from '../../assets/other_addresses.svg'

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
  title: {
    marginTop: 15,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 22,
    marginBottom: 25,
  },
})

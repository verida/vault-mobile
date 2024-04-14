import { useActionSheet } from '@expo/react-native-action-sheet'
import Clipboard from '@react-native-community/clipboard'
import {
  getBlockchainNetworkLabel,
  getBlockchainNetworks,
} from 'features/blockchain'
import { Body, Left, ListItem, Right, Text } from 'native-base'
import React from 'react'
import { StyleSheet } from 'react-native'
import FastImage from 'react-native-fast-image'
import { store } from 'reduxStore'

import RightArrowSvg from '../../assets/icons/data/right-arrow.svg'

export default ({ item, onPressSeedPhrase, onPressPrivateKey }) => {
  const { showActionSheetWithOptions } = useActionSheet()
  const blockchainNetworks = getBlockchainNetworks(store.getState())
  const network = blockchainNetworks[item.chainId]
  const networkLabel = getBlockchainNetworkLabel(network)

  let options = ['Copy address', 'Show Seed Phrase']
  if (item.privateKey) {
    options.push('Show Private Key')
  }
  options.push('Cancel')

  return (
    <ListItem
      button
      onPress={() => {
        showActionSheetWithOptions(
          {
            options: options,
            cancelButtonIndex: options.length,
          },
          (buttonIndex) => {
            if (buttonIndex === 0) {
              Clipboard.setString(item.address)
            }
            if (item.mnemonic && buttonIndex === 1) {
              onPressSeedPhrase(item.mnemonic)
            }
            if (item.privateKey && buttonIndex === 2) {
              onPressPrivateKey(item.privateKey)
            }
          }
        )
      }}
      style={styles.item}>
      <Left style={styles.itemWrapper}>
        <FastImage source={{ uri: network.icon }} style={styles.icon} />
        <Body>
          <Text style={styles.label}>
            {item.name ? item.name : networkLabel}
          </Text>
          <Text note>{`${item.address}`}</Text>
        </Body>
      </Left>
      <Right>
        <RightArrowSvg />
      </Right>
    </ListItem>
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginLeft: 0,
    paddingLeft: 16,
  },
  label: { marginBottom: 3, marginTop: 3 },
  itemWrapper: { flex: 2, alignItems: 'center' },
  icon: {
    width: 45,
    height: 45,
  },
})

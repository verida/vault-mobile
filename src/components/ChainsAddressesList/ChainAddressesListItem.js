import { useActionSheet } from '@expo/react-native-action-sheet'
import Clipboard from '@react-native-community/clipboard'
import { Body, Left, ListItem, Right, Text } from 'native-base'
import React from 'react'
import { Image, StyleSheet } from 'react-native'

import RightArrowSvg from '../../assets/icons/data/right-arrow.svg'

export default ({
  item,
  singleWallet,
  onPressSeedPhrase,
  onPressPrivateKey,
}) => {
  const { showActionSheetWithOptions } = useActionSheet()
  let options = ['Copy address', 'Show Seed Phrase']
  if (item.addressMap === 'evm') {
    options.push('Show Private Key')
  }
  options.push('Cancel')

  return (
    <ListItem
      button
      onPress={() => {
        if (singleWallet) return
        showActionSheetWithOptions(
          {
            options: options,
            cancelButtonIndex: options.length,
          },
          (buttonIndex) => {
            if (buttonIndex === 0) {
              Clipboard.setString(item.address)
            }
            if (item.seedPhrase && buttonIndex === 1) {
              onPressSeedPhrase(item.seedPhrase)
            }
            if (item.addressMap === 'evm' && buttonIndex === 2) {
              onPressPrivateKey(item.privateKey)
            }
          }
        )
      }}
      style={styles.item}>
      <Left style={styles.itemWrapper}>
        <Image source={{ uri: item.icon }} style={styles.icon} />
        <Body>
          <Text style={styles.label}>{item.name}</Text>
          <Text note>{`${item.address}`}</Text>
        </Body>
      </Left>
      <Right>{!singleWallet && <RightArrowSvg />}</Right>
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

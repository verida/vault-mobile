import React from 'react'
import { FlatList } from 'react-native'

import ChainAddressesListItem from './ChainAddressesListItem'

export default ({
  list,
  singleWallet,
  onPressSeedPhrase,
  onPressPrivateKey,
}) => {
  const renderItem = ({ item }) => (
    <ChainAddressesListItem
      item={item}
      onPressPrivateKey={onPressPrivateKey}
      onPressSeedPhrase={onPressSeedPhrase}
      singleWallet={singleWallet}
    />
  )

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={(item) => item.address}
    />
  )
}

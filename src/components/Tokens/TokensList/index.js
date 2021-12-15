import React from 'react'
import { FlatList } from 'react-native'

import TokensListItem from './TokensListItem'

export default ({ list, onPressItem }) => {
  const renderItem = ({ item }) => (
    <TokensListItem item={item} onPressItem={onPressItem} />
  )

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={(item) => item.address}
    />
  )
}

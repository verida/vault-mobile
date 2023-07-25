import { tokenCaipObjectToString } from 'features/cryptoWallet'
import React from 'react'
import { FlatList } from 'react-native'

import TokensListItem from './TokensListItem'

export default ({ list, onPressItem, onPullToRefresh, refreshing }) => {
  const renderItem = ({ item }) => (
    <TokensListItem item={item} onPressItem={onPressItem} />
  )

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={(item) => tokenCaipObjectToString(item.asset)}
      onRefresh={onPullToRefresh}
      refreshing={refreshing}
    />
  )
}

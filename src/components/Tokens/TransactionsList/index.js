import React from 'react'
import { FlatList } from 'react-native'

import TransactionsListItem from './TransactionsListItem'

export default ({ symbol, list }) => {
  const renderItem = ({ item }) => (
    <TransactionsListItem symbol={symbol} item={item} />
  )

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  )
}

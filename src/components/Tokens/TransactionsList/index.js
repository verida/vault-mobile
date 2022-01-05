import React from 'react'
import { FlatList, Text, View } from 'react-native'

import TransactionsListItem from './TransactionsListItem'

export default ({ symbol, list }) => {
  const renderItem = ({ item }) => (
    <TransactionsListItem symbol={symbol} item={item} />
  )

  const emptyList = () => (
    <View style={{ alignItems: 'center' }}>
      <Text>No transactions yet</Text>
    </View>
  )

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={emptyList}
    />
  )
}

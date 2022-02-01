import React from 'react'
import { FlatList, Text, View } from 'react-native'

import TransactionsListItem from './TransactionsListItem'

export default ({ symbol, decimal, list, onPullToRefresh, refreshing }) => {
  const renderItem = ({ item }) => (
    <TransactionsListItem symbol={symbol} decimal={decimal} item={item} />
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
      onRefresh={onPullToRefresh}
      refreshing={refreshing}
    />
  )
}

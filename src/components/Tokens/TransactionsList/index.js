import React from 'react'
import { FlatList, Text, View } from 'react-native'

import TransactionsListItem from './TransactionsListItem'

export default ({
  symbol,
  decimal,
  token,
  blockchainNetwork,
  list,
  errorType,
  onPullToRefresh,
  refreshing,
}) => {
  const renderItem = ({ item }) => (
    <TransactionsListItem
      symbol={symbol}
      token={token}
      decimal={decimal}
      item={item}
    />
  )

  let errorMessage = 'No transactions found'
  switch (errorType) {
    case 'error':
      errorMessage = 'Server error. Please try again later.'
      break
    case 'unsupported':
      errorMessage = `${blockchainNetwork.label} does not currently support transaction lists`
      break
  }

  const emptyList = () => (
    <View style={{ alignItems: 'center' }}>
      <Text>{errorMessage}</Text>
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

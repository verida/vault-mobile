import {
  getBlockchainNetworkLabel,
  SupportedTokenObject,
  Transaction,
} from 'features/cryptoWallet'
import React from 'react'
import { FlatList, Text, View } from 'react-native'

import { BlockchainNetwork } from 'api/types'

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
}: {
  readonly symbol: string | undefined
  readonly decimal: number
  readonly token: SupportedTokenObject | undefined
  readonly blockchainNetwork: BlockchainNetwork | undefined
  readonly list: readonly Transaction[]
  readonly errorType?: unknown
  readonly onPullToRefresh: () => void
  readonly refreshing: boolean
}) => {
  const renderItem = React.useCallback(
    ({ item }) => (
      <TransactionsListItem
        symbol={symbol}
        token={token}
        decimal={decimal}
        item={item}
      />
    ),
    [decimal, symbol, token]
  )

  let errorMessage = 'No transactions found'
  switch (errorType) {
    case 'error':
      errorMessage = 'Server error. Please try again later.'
      break
    case 'unsupported':
      errorMessage = `${getBlockchainNetworkLabel(
        blockchainNetwork
      )} does not currently support transaction lists`
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

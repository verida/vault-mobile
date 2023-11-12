import {
  AggregateWalletBannerBalance,
  Transaction,
  useMaybeChainMetadataForResource,
} from 'features/cryptoWallet'
import React from 'react'
import { FlatList, Text, View } from 'react-native'

import TransactionsListItem from './TransactionsListItem'

export default ({
  aggregateWalletBannerBalance,
  list,
  errorType,
  onPullToRefresh,
  refreshing,
}: {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly list: readonly Transaction[]
  readonly errorType?: unknown
  readonly onPullToRefresh: () => void
  readonly refreshing: boolean
}) => {
  const renderItem = React.useCallback(
    ({ item }) => (
      <TransactionsListItem
        aggregateWalletBannerBalance={aggregateWalletBannerBalance}
        item={item}
      />
    ),
    [aggregateWalletBannerBalance]
  )
  const { resource } = aggregateWalletBannerBalance

  const maybeChainMetadata = useMaybeChainMetadataForResource({ resource })

  let errorMessage = 'No transactions found'
  switch (errorType) {
    case 'error':
      errorMessage = 'Server error. Please try again later.'
      break
    case 'unsupported':
      errorMessage = `${maybeChainMetadata?.name} does not currently support transaction lists`
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

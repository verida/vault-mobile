import React, { useCallback } from 'react'
import { FlatList, Text, View } from 'react-native'

import {
  AggregateWalletBannerBalance,
  Transaction,
  useMaybeChainMetadataForResource,
} from '~/features/cryptoWallet'

import { TransactionsListItem } from './TransactionsListItem'

export type TransactionListProps = {
  readonly aggregateWalletBannerBalance?: AggregateWalletBannerBalance
  readonly list: readonly Transaction[]
  readonly errorType?: unknown
  readonly onPullToRefresh: () => void
  readonly refreshing: boolean
}

export const TransactionsList: React.FC<TransactionListProps> = (props) => {
  const {
    aggregateWalletBannerBalance,
    list,
    errorType,
    onPullToRefresh,
    refreshing,
  } = props

  const renderItem = useCallback(
    ({ item }) => {
      if (!aggregateWalletBannerBalance) {
        return null
      }
      return (
        <TransactionsListItem
          aggregateWalletBannerBalance={aggregateWalletBannerBalance}
          item={item}
        />
      )
    },
    [aggregateWalletBannerBalance]
  )

  const maybeChainMetadata = aggregateWalletBannerBalance?.resource
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useMaybeChainMetadataForResource({
        resource: aggregateWalletBannerBalance.resource,
      })
    : null

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

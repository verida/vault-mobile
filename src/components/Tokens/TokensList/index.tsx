import {
  AggregateWalletBannerBalance,
  AggregateWalletBannerBalances,
} from 'features/cryptoWallet'
import React from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import { TokensListItem } from './TokensList.Item'

const defaultOnPullToRefresh = () => undefined

const TokensList = React.memo(function TokensList({
  aggregateWalletBannerBalances,
  onPressItem,
  onPullToRefresh = defaultOnPullToRefresh,
  refreshing = false,
}: {
  readonly aggregateWalletBannerBalances: AggregateWalletBannerBalances
  readonly onPullToRefresh?: () => void
  readonly onPressItem: (
    aggregateWalletBannerBalance: AggregateWalletBannerBalance
  ) => void
  readonly refreshing?: boolean
}): JSX.Element {
  const renderItem: ListRenderItem<AggregateWalletBannerBalance> =
    React.useCallback(
      ({ item: aggregateWalletBannerBalance }) => (
        <TokensListItem
          aggregateWalletBannerBalance={aggregateWalletBannerBalance}
          onPress={() => onPressItem(aggregateWalletBannerBalance)}
        />
      ),
      [onPressItem]
    )
  return (
    <FlatList
      data={aggregateWalletBannerBalances}
      renderItem={renderItem}
      keyExtractor={React.useCallback(
        (item: AggregateWalletBannerBalance) =>
          // TODO: needs a better implementation than this
          `${JSON.stringify(item.resource)}${item.type}`,
        []
      )}
      onRefresh={onPullToRefresh}
      refreshing={refreshing}
    />
  )
})

export default TokensList

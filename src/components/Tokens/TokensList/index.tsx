import {
  BalanceByChainResult,
  tokenCaipObjectToString,
} from 'features/cryptoWallet'
import React from 'react'
import { FlatList } from 'react-native'

import TokensListItem from './TokensListItem'

const defaultOnPullToRefresh = () => undefined

const TokensList = React.memo(function TokensList({
  list: data,
  onPressItem,
  onPullToRefresh = defaultOnPullToRefresh,
  refreshing = false,
}: {
  readonly list: readonly BalanceByChainResult[]
  readonly onPullToRefresh?: () => void
  readonly onPressItem: (item: BalanceByChainResult) => void
  readonly refreshing?: boolean
}): JSX.Element {
  return (
    <FlatList
      data={data}
      renderItem={React.useCallback(
        ({ item }) => (
          <TokensListItem item={item} onPressItem={onPressItem} />
        ),
        [onPressItem]
      )}
      keyExtractor={React.useCallback(
        (item) => tokenCaipObjectToString(item.asset),
        []
      )}
      onRefresh={onPullToRefresh}
      refreshing={refreshing}
    />
  )
})

export default TokensList

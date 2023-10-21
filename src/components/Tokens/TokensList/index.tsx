import {
  BalanceByChainResult,
  isBalanceByChainResult,
  SelectSingleTokenData,
  tokenCaipObjectToString,
} from 'features/cryptoWallet'
import React from 'react'
import { FlatList } from 'react-native'

import TokensListItem from './TokensListItem'

const TokensList = React.memo(function TokensList({
  list: maybeList,
  onPressItem,
  onPullToRefresh,
  refreshing,
}: {
  readonly list: readonly SelectSingleTokenData[]
  readonly onPullToRefresh: () => void
  readonly onPressItem: (item: SelectSingleTokenData) => void
  readonly refreshing: boolean
}): JSX.Element {
  return (
    <FlatList
      data={React.useMemo<readonly BalanceByChainResult[]>(
        () =>
          (maybeList || []).flatMap((e: SelectSingleTokenData) =>
            isBalanceByChainResult(e) ? [e] : []
          ),
        [maybeList]
      )}
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

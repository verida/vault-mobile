import {
  AggregateWalletBannerBalance,
  AggregateWalletBannerBalances,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native'

import { Theme } from 'styles/types'

import { TokensListItem } from './TokensList.Item'

const defaultOnPullToRefresh = () => undefined

const keyExtractor = (item: AggregateWalletBannerBalance) => {
  // TODO: needs a better implementation than this
  return `${JSON.stringify(item.resource)}${item.type}`
}

type TokensListProps = {
  readonly aggregateWalletBannerBalances: AggregateWalletBannerBalances
  readonly onPullToRefresh?: () => void
  readonly onPressItem: (
    aggregateWalletBannerBalance: AggregateWalletBannerBalance
  ) => void
  readonly refreshing?: boolean
}

export const TokensList: React.FC<TokensListProps> = (props) => {
  const {
    aggregateWalletBannerBalances,
    onPressItem,
    onPullToRefresh = defaultOnPullToRefresh,
    refreshing = false,
  } = props

  const styles = useThemeAwareStyle(createStyles)

  const renderItem: ListRenderItem<AggregateWalletBannerBalance> =
    React.useCallback(
      ({ item }) => (
        <TokensListItem
          aggregateWalletBannerBalance={item}
          onPress={() => onPressItem(item)}
        />
      ),
      [onPressItem]
    )

  return (
    <FlatList<AggregateWalletBannerBalance>
      data={aggregateWalletBannerBalances}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onRefresh={onPullToRefresh}
      refreshing={refreshing}
      contentContainerStyle={styles.contentContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    contentContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.color.lightGrey,
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
    separator: {
      height: 1,
      backgroundColor: theme.color.lightGrey,
    },
  })

import {
  AggregateWalletBannerBalance,
  AggregateWalletBannerBalances,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native'

import { Typography } from '~/components'

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
  readonly error?: Error
}

export const TokensList: React.FC<TokensListProps> = (props) => {
  const {
    aggregateWalletBannerBalances,
    onPressItem,
    onPullToRefresh = defaultOnPullToRefresh,
    refreshing = false,
    error,
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

  const hasData = aggregateWalletBannerBalances.length > 0

  return (
    <FlatList<AggregateWalletBannerBalance>
      data={aggregateWalletBannerBalances}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onRefresh={onPullToRefresh}
      refreshing={refreshing}
      contentContainerStyle={
        hasData ? styles.contentContainer : styles.emptyContentContainer
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={() => (
        <View style={styles.emptyMessageContainer}>
          <Typography variant='h5SemiBold' style={styles.emptyMessage}>
            {error
              ? 'Something went wrong!\nPull down to refresh'
              : refreshing
                ? 'Refreshing the list of coins...'
                : "You don't have any coins yet"}
          </Typography>
        </View>
      )}
    />
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    emptyContentContainer: {
      flex: 1,
    },
    contentContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.color.lightGrey,
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
    separator: {
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
    emptyMessageContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyMessage: {
      textAlign: 'center',
    },
  })

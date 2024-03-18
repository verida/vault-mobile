import {
  AggregateWalletBannerBalance,
  AggregateWalletBannerBalances,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native'

import { Theme } from 'styles/types'

import { TokensListItem } from './TokensList.Item'
import { Typography } from '~/components'

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
          style={styles.bottomBorder}
        />
      ),
      [onPressItem, styles.bottomBorder]
    )

  return (
    <FlatList<AggregateWalletBannerBalance>
      data={aggregateWalletBannerBalances}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onRefresh={onPullToRefresh}
      refreshing={refreshing}
      contentContainerStyle={styles.contentContainer}
      ListEmptyComponent={() => (
        <View>
          <Typography variant='h5SemiBold' style={styles.emptyListTitle}>
            {error
              ? 'Something went wrong!\nPull down to refresh'
              : "You don't have any coins yet"}
          </Typography>
        </View>
      )}
    />
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    contentContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.color.lightGrey,
    },
    bottomBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.color.lightGrey,
    },
    emptyListTitle: {
      marginTop: theme.spacing.m,
      textAlign: 'center',
    },
  })

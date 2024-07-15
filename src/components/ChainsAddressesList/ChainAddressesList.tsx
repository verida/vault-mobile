import React, { useCallback } from 'react'
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native'

import { Typography } from '~/components/Typography'
import { LegacyCryptoWalletAccount } from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import { ChainAddressesListItem } from './ChainAddressesListItem'

export type ChainAddressesListProps = {
  list: LegacyCryptoWalletAccount[]
}

export const ChainAddressesList: React.FC<ChainAddressesListProps> = (
  props
) => {
  const { list } = props

  // HACK: Remove duplicates. Whould not be necessary when accounts are properly set
  const tempMap = new Map<string, LegacyCryptoWalletAccount>()
  list.forEach((item) => {
    tempMap.set(item.namespace, item)
  })
  const filteredList = Array.from(tempMap.values())

  const styles = useThemeAwareStyle(createStyles)

  const renderItem: ListRenderItem<LegacyCryptoWalletAccount> = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <ChainAddressesListItem item={item} />
      </View>
    ),
    [styles.item]
  )

  const hasData = filteredList.length > 0

  return (
    <FlatList<LegacyCryptoWalletAccount>
      data={filteredList}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.namespace}-${item.address}`}
      alwaysBounceVertical={false}
      contentContainerStyle={
        hasData ? styles.contentContainer : styles.emptyContentContainer
      }
      ListEmptyComponent={() => (
        <View style={styles.emptyMessageContainer}>
          <Typography variant='h5SemiBold' style={styles.emptyMessage}>
            No accounts in this wallet
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
    },
    item: {
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

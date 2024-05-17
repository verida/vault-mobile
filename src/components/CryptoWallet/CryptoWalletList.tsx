import React, { ComponentProps, useCallback } from 'react'
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native'

import { Typography } from '~/components/Typography'
import {
  LegacyCryptoWallet,
  useCryptoWallets,
  useCryptoWalletsStatus,
  useSelectedCryptoWallet,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import { CryptoWalletListItem } from './CryptoWalletListItem'

export type CryptoWalletListProps = Pick<
  ComponentProps<typeof FlatList<LegacyCryptoWallet>>,
  'style' | 'contentContainerStyle'
> & {
  onPressItem?: (item: LegacyCryptoWallet) => void
  showMoreIcon?: boolean
}

const keyExtractor = (item: LegacyCryptoWallet) => {
  return item.id
}

export const CryptoWalletList: React.FC<CryptoWalletListProps> = (props) => {
  const { onPressItem, showMoreIcon, contentContainerStyle, ...listProps } =
    props

  const cryptoWallets = useCryptoWallets()
  const { processsing } = useCryptoWalletsStatus()
  const selectedCryptoWallet = useSelectedCryptoWallet()

  const styles = useThemeAwareStyle(createStyles)

  const renderItem: ListRenderItem<LegacyCryptoWallet> = useCallback(
    ({ item: cryptoWallet }) => (
      <View style={styles.item}>
        <CryptoWalletListItem
          item={cryptoWallet}
          onPress={onPressItem}
          selected={selectedCryptoWallet?.id === cryptoWallet.id}
          showMoreIcon={showMoreIcon}
        />
      </View>
    ),
    [onPressItem, selectedCryptoWallet, showMoreIcon, styles.item]
  )

  const hasData = cryptoWallets.length > 0

  // TODO: Factorise List component
  return (
    <FlatList<LegacyCryptoWallet>
      {...listProps}
      data={cryptoWallets}
      refreshing={processsing}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      alwaysBounceVertical={false}
      contentContainerStyle={[
        hasData ? styles.contentContainer : styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      ListEmptyComponent={() => (
        <View style={styles.emptyMessageContainer}>
          <Typography variant='h5SemiBold' style={styles.emptyMessage}>
            {processsing && !selectedCryptoWallet
              ? 'Loading crypto wallets...'
              : 'No crypto wallets'}
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

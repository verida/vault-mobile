import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

import { LegacyCryptoWallet } from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import { CryptoWalletListItem } from './CryptoWalletListItem'

export type CryptoWalletListProps = {
  list: LegacyCryptoWallet[]
  selectedWalletId: string | null
  onPressItem?: (item: LegacyCryptoWallet) => void
  showMoreIcon?: boolean
}

export const CryptoWalletList: React.FC<CryptoWalletListProps> = (props) => {
  const { list, onPressItem, showMoreIcon, selectedWalletId } = props

  const styles = useThemeAwareStyle(createStyles)

  return (
    <SwipeListView
      data={list}
      style={styles.listView}
      renderItem={(data) => (
        <View
          style={[
            styles.listItemWrapper,
            // TODO: Check why needs?
            // data.item.other && styles.otherListItem,
          ]}>
          <CryptoWalletListItem
            item={data.item}
            onPress={onPressItem}
            selected={selectedWalletId === data.item.id}
            showMoreIcon={showMoreIcon}
          />
        </View>
      )}
    />
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listView: {
      borderTopWidth: 0.5,
      borderTopColor: theme.color.separatorLight,
    },
    listItemWrapper: {
      backgroundColor: theme.color.background,
    },
  })

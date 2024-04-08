import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

import { LegacyCryptoWallet } from '~/features/cryptoWallet'

import WalletListItem from 'components/WalletList/WalletListItem'
import { SEPARATOR_LIGHT, WHITE_COLOR } from 'constants/color'

interface WalletListProps {
  list: LegacyCryptoWallet[]
  selectedWalletId: string | null
  onPressItem?: (item: LegacyCryptoWallet) => void
  leftIconType?: 'checked' | 'dots'
}

const WalletList = ({
  list,
  onPressItem,
  leftIconType = 'dots',
  selectedWalletId,
}: WalletListProps) => {
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
          <WalletListItem
            item={data.item}
            onPressItem={onPressItem}
            leftIconType={leftIconType}
            selected={selectedWalletId === data.item._id}
          />
        </View>
      )}
    />
  )
}

export default WalletList

const styles = StyleSheet.create({
  listView: {
    borderTopWidth: 0.5,
    borderTopColor: SEPARATOR_LIGHT,
  },
  listItemWrapper: {
    borderTopColor: SEPARATOR_LIGHT,
  },
  otherListItem: {
    marginTop: 30,
    borderTopWidth: 0.5,
  },
  removeButton: {
    width: 80,
    backgroundColor: 'red',
    alignSelf: 'flex-end',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonOther: {
    marginTop: 30.5,
  },
  removeButtonText: { color: WHITE_COLOR, textAlign: 'center' },
})

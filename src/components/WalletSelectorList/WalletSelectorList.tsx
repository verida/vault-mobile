import React from 'react'
import {
  StyleSheet,
  // Alert,
  // Text,
  // TouchableOpacity,
  View,
} from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

import { SEPARATOR_LIGHT, WHITE_COLOR } from 'constants/color'

import WalletSelectorListItem, { WalletItemProps } from './WalletSelectorListItem'
import { AccountsType } from 'pages/Wallets/ManageWallets'

interface WalletSelectorListProps {
  list: WalletItemProps[]
  selectedWalletId: string
  onPressItem: any
  leftIconType: 'checked' | 'dots'
}

const WalletSelectorList = ({ list, onPressItem, selectedWalletId }: WalletSelectorListProps) => {

  return (
    <SwipeListView
      data={list}
      style={styles.listView}
      renderItem={(data) => (
        <View
          style={[
            styles.listItemWrapper,
            data.item.other && styles.otherListItem,
          ]}>
          <WalletSelectorListItem
            onPressItem={onPressItem}
            item={data.item}
            leftIconType="dots"
            selectedWalletId={selectedWalletId}
          />
        </View>
      )}
    />
  )
}

export default WalletSelectorList

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


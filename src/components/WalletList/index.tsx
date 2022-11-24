import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

import WalletListItem from 'components/WalletList/WalletListItem'
import { SEPARATOR_LIGHT, WHITE_COLOR } from 'constants/color'

import { WalletItemProps } from './types'

interface WalletListProps {
  list: WalletItemProps[]
  selectedWalletId: string | number
  onPressItem: any
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
            data.item.other && styles.otherListItem,
          ]}>
          <WalletListItem
            onPressItem={onPressItem}
            item={data.item}
            leftIconType={leftIconType}
            selectedWalletId={selectedWalletId}
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

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import CheckBoxIcon from 'assets/checkbox_icon.svg'
import MoreIcon from 'assets/more_icon.svg'
import MultichainWalletIcon from 'assets/multichain_wallet_icon.svg'
import { BLACK_COLOR_OPACITY, TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS } from 'constants/text'

import { WalletItemProps } from './types'

interface WalletListItemProps {
  item: WalletItemProps
  selectedWalletId: string | number
  onPressItem?: any
  leftIconType: 'checked' | 'dots'
}

const WalletListItem = ({
  item,
  leftIconType = 'dots',
  onPressItem,
  selectedWalletId,
}: WalletListItemProps) => {
  const isItemSelected = selectedWalletId === item.id

  const handleOnPressAction = () => {
    if (onPressItem) {
      onPressItem(item)
    }
  }

  return (
    <TouchableOpacity
      onPress={handleOnPressAction}
      style={[styles.container, isItemSelected && styles.selectedItem]}>
      <View style={styles.content}>
        <View>
          {isItemSelected && leftIconType === 'dots' && (
            <View style={styles.checkedIcon}>
              <CheckBoxIcon />
            </View>
          )}
          <MultichainWalletIcon />
        </View>
        <View style={styles.textContent}>
          <Text style={styles.textTitle}>{item.label}</Text>
          <Text style={styles.subText}>{`${item.count} addresses`}</Text>
        </View>
      </View>
      <View>
        {leftIconType === 'dots' && <MoreIcon />}
        {leftIconType === 'checked' && isItemSelected && <CheckBoxIcon />}
      </View>
    </TouchableOpacity>
  )
}

export default WalletListItem

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: WHITE_COLOR,
    borderColor: BLACK_COLOR_OPACITY(0.1),
    borderWidth: 0.2,
  },
  selectedItem: {
    backgroundColor: '#F5F4FF',
  },
  checkedIcon: {
    position: 'absolute',
    top: -6,
    right: -3,
    zIndex: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  avatarIcon: {
    width: 45,
    height: 45,
  },
  textContent: {
    marginHorizontal: 15,
  },
  textTitle: {
    fontSize: 17,
    fontFamily: NUNITO_SANS,
    textTransform: 'capitalize',
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  subText: {
    fontSize: 14,
    fontFamily: NUNITO_SANS,
    fontWeight: '400',
    color: TEXT_COLOR,
  },
})

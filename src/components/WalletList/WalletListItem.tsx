import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getTruncatedWalletAddress } from 'wallet/helpers/tokens'

import CheckBoxIcon from 'assets/checkbox_icon.svg'
import MoreIcon from 'assets/more_icon.svg'
import MultichainWalletIcon from 'assets/multichain_wallet_icon.svg'
import {
  BLACK_COLOR_OPACITY,
  PRIMARY_COLOR_200,
  TEXT_COLOR,
  WHITE_COLOR,
} from 'constants/color'
import { NUNITO_SANS } from 'constants/text'
import { WalletItem } from 'utils/types/wallets'

interface WalletListItemProps {
  item: WalletItem
  selected: boolean
  onPressItem?: (item: WalletItem) => void
  leftIconType: 'checked' | 'dots'
}

const WalletListItem = ({
  item,
  selected,
  leftIconType = 'dots',
  onPressItem,
}: WalletListItemProps) => {
  const handleOnPressAction = () => {
    if (onPressItem) {
      onPressItem(item)
    }
  }

  return (
    <TouchableOpacity
      onPress={handleOnPressAction}
      style={[styles.container, selected && styles.selectedItem]}>
      <View style={styles.content}>
        <View>
          {selected && leftIconType === 'dots' && (
            <View style={styles.checkedIcon}>
              <CheckBoxIcon />
            </View>
          )}
          {item.icon ? (
            <Image source={{ uri: item.icon }} style={styles.icon} />
          ) : (
            <MultichainWalletIcon />
          )}
        </View>
        <View style={styles.textContent}>
          <Text style={styles.textTitle}>{item.label}</Text>
          <Text style={styles.subText}>
            {item.address
              ? getTruncatedWalletAddress(item.address)
              : `${item.count} addresses`}
          </Text>
        </View>
      </View>
      <View>
        {leftIconType === 'dots' && <MoreIcon />}
        {leftIconType === 'checked' && selected && <CheckBoxIcon />}
      </View>
    </TouchableOpacity>
  )
}

export default WalletListItem

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 17,
    paddingBottom: 18,
    paddingRight: 12,
    paddingLeft: 16,
    backgroundColor: WHITE_COLOR,
    borderColor: BLACK_COLOR_OPACITY(0.1),
    borderWidth: 0.2,
    borderBottomWidth: 0.6,
  },
  selectedItem: {
    backgroundColor: PRIMARY_COLOR_200,
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
    marginLeft: 16,
  },
  textTitle: {
    fontSize: 17,
    fontFamily: NUNITO_SANS,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  subText: {
    fontSize: 14,
    fontFamily: NUNITO_SANS,
    fontWeight: '400',
    color: TEXT_COLOR,
  },
  icon: {
    width: 50,
    height: 50,
  },
})

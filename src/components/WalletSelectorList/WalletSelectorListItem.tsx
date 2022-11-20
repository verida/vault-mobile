import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

import { TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS } from 'constants/text'

import MultichainWalletIcon from 'assets/multichain_wallet_icon.svg'
import CheckBoxIcon from 'assets/checkbox_icon.svg'
import MoreIcon from 'assets/more_icon.svg'
import { AccountsType } from 'pages/Wallets/ManageWallets'

export type WalletItemProps = {
  count: number,
  icon: Element,
  id: string,
  label: string
  other?: any
}

export type WalletType = {
  id: string
  type: string
  seedPhrase: string
  label: string
  accounts: [AccountsType]
  chain?: string
}

interface WalletSelectorListItemProps {
  item: WalletItemProps
  selectedWalletId: string | number
  onPressItem?: any
  leftIconType: 'checked' | 'dots'
}

const WalletSelectorListItem = ({ item, leftIconType, onPressItem, selectedWalletId }: WalletSelectorListItemProps) => {
  const isItemSelected = selectedWalletId === item.id

  const handleOnPressAction = () => {
    if (onPressItem) {
      onPressItem(item)
    }
  }

  return (
    <TouchableOpacity onPress={handleOnPressAction} style={[
      styles.container,
      isItemSelected
      && styles.selectedItem]}>
      <View style={styles.content}>
        <View>
          {isItemSelected && leftIconType === 'dots' && <View style={styles.checkedIcon}>
            <CheckBoxIcon />
          </View>}
          <MultichainWalletIcon />
        </View>
        {/* <View>
          {item.icon ? <Image style={styles.avatarIcon} source={{ uri: item.icon }} /> : <MultichainWalletIcon />}
        </View> */}
        <View
          style={{
            marginHorizontal: 15,
          }}>
          <Text style={styles.textTitle}>
            {item.label}
          </Text>
          <Text style={styles.subText}>
            {`${item.count} addresses`}
          </Text>
        </View>
      </View>
      <View>
        {leftIconType === 'dots' && <MoreIcon />}
        {leftIconType === 'checked' && isItemSelected && <CheckBoxIcon />}
      </View>
    </TouchableOpacity>
  )
}

export default WalletSelectorListItem

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: WHITE_COLOR,
    borderColor: 'rgba(60, 60, 67, 0.16)',
    borderWidth: 0.2,
  },
  selectedItem: {
    backgroundColor: '#F5F4FF'
  },
  checkedIcon: {
    position: 'absolute',
    top: -6,
    right: -3,
    zIndex: 3
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  avatarIcon: {
    width: 45,
    height: 45,
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
  }
})

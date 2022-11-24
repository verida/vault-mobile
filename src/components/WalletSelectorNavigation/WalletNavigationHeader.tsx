import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import ChevronDownIcon from 'assets/chevron_down_icon.svg'
import MultichainWalletIcon from 'assets/wallet_icon_32.svg'
import { WalletItemProps } from 'components/WalletList/types'
import { BLACK_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'

interface WalletNavigationHeaderProps {
  selectedWallet: WalletItemProps | undefined
  openWalletModal: () => void
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const WalletNavigationHeader = (props: WalletNavigationHeaderProps) => {
  const { selectedWallet, openWalletModal } = props

  return (
    <Pressable
      hitSlop={HIT_SLOP}
      style={styles.container}
      onPress={openWalletModal}>
      <View>
        <MultichainWalletIcon />
      </View>
      <View style={styles.navigationContent}>
        <View style={styles.textWrapper}>
          <Text style={styles.textTitle}>{selectedWallet?.label}</Text>
          <View
            style={{
              marginTop: 3,
            }}>
            <ChevronDownIcon />
          </View>
        </View>
        <Text style={styles.subText}>{selectedWallet?.count} addresses</Text>
      </View>
    </Pressable>
  )
}

export default WalletNavigationHeader

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  textWrapper: { flexDirection: 'row' },
  navigationContent: { marginHorizontal: 10 },
  textTitle: {
    fontSize: 14,
    fontFamily: NUNITO_SANS_BOLD,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: BLACK_COLOR,
  },
  subText: {
    fontSize: 12,
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    color: BLACK_COLOR,
  },
})

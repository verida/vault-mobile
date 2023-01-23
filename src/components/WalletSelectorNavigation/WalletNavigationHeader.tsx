import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { WalletItem } from 'types/wallet'
import { getTruncatedWalletAddress } from 'wallet/helpers/tokens'

import ChevronDownIcon from 'assets/chevron_down_icon.svg'
import MultichainWalletIcon from 'assets/wallet_icon_32.svg'
import { BLACK_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'

interface WalletNavigationHeaderProps {
  selectedWallet: WalletItem | undefined
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
        {selectedWallet?.icon ? (
          <Image source={{ uri: selectedWallet.icon }} style={styles.icon} />
        ) : (
          <MultichainWalletIcon />
        )}
      </View>
      <View style={styles.navigationContent}>
        <View style={styles.textWrapper}>
          <Text style={styles.textTitle}>{selectedWallet?.label}</Text>
          <View>
            <ChevronDownIcon />
          </View>
        </View>
        <Text style={styles.subText}>
          {selectedWallet?.address
            ? getTruncatedWalletAddress(selectedWallet?.address)
            : `${selectedWallet?.count} addresses`}
        </Text>
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
  icon: {
    width: 32,
    height: 32,
  },
})

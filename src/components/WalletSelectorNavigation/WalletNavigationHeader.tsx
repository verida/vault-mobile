import { Icon } from 'components'
import { useTheme } from 'contexts'
import { BlockchainWalletWithAccounts } from 'features/blockchain'
import { getTruncatedWalletAddress } from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Avatar } from 'components/Images'
import { Theme } from 'styles/types'

interface WalletNavigationHeaderProps {
  selectedWallet: BlockchainWalletWithAccounts | null
  openWalletModal: () => void
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const WalletNavigationHeader = (props: WalletNavigationHeaderProps) => {
  const { selectedWallet, openWalletModal } = props

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  return (
    <Pressable
      hitSlop={HIT_SLOP}
      style={styles.container}
      onPress={openWalletModal}>
      <View style={styles.logoContainer}>
        <Avatar
          source={selectedWallet?.icon}
          fallbackType='wallet'
          style={styles.icon}
          borderColor={theme.color.primary100}
          fallbackColor={theme.color.primary}
          fallbackBackgroundColor={theme.color.primary200}
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.textWrapper}>
          <Text style={styles.label} numberOfLines={1} ellipsizeMode='tail'>
            {selectedWallet?.label}
          </Text>
          <Icon name='chevron-down' size={16} />
        </View>
        {selectedWallet ? (
          <Text style={styles.address} numberOfLines={1} ellipsizeMode='middle'>
            {selectedWallet.address
              ? getTruncatedWalletAddress(selectedWallet.address)
              : `${selectedWallet.count} addresses`}
          </Text>
        ) : null}
      </View>
    </Pressable>
  )
}

export default WalletNavigationHeader

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      marginRight: theme.spacing.s,
    },
    textContainer: {
      justifyContent: 'space-between',
    },
    textWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      fontSize: theme.fontSize.sl,
      lineHeight: theme.fontSize.xl,
      fontFamily: theme.fontFamily.bold,
    },
    address: {
      fontSize: theme.fontSize.s,
      lineHeight: theme.fontSize.m,
      fontFamily: theme.fontFamily.semibold,
      color: theme.color.textLightGrey,
    },
    icon: {
      width: 32,
      height: 32,
    },
  })

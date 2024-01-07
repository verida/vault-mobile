import { useNavigation } from '@react-navigation/native'
import { Icon } from 'components'
import { useTheme } from 'contexts'
import {
  getUniqueWalletAddresses,
  getWallets,
  useGetBalancesQuery,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native'
import { useSelector } from 'react-redux'
import { formatFiatCurrency } from 'utils'

import { Theme } from 'styles/types'

type CryptoWalletOverviewProps = ViewProps

export const HomeCryptoWalletOverview: React.FC<CryptoWalletOverviewProps> = (
  props
) => {
  const { ...viewProps } = props

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  const navigation = useNavigation()
  const currentWallet = useSelector(getWallets)
  const addresses = getUniqueWalletAddresses(currentWallet)
  const { data } = useGetBalancesQuery(addresses)
  const { total } = data || {}
  const displayedLabel = currentWallet?.label || 'Crypto Wallet'
  const displayedTotal = formatFiatCurrency(total || 0)

  const handlePress = () => {
    navigation.navigate('Assets' as never)
  }

  return (
    <View {...viewProps}>
      <Pressable style={styles.container} onPress={handlePress}>
        <View style={styles.walletDetails}>
          <View style={styles.walletIcon}>
            <Icon name='wallet' size={24} color={theme.color.primary} />
          </View>
          <View>
            <Text style={styles.walletLabel}>{displayedLabel}</Text>
            <Text style={styles.walletAmount}>{displayedTotal}</Text>
          </View>
        </View>
        <Icon name='chevron-forward' size={24} color={theme.color.primary} />
      </Pressable>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.color.primary200,
      borderRadius: theme.roundness.xs,
      padding: theme.spacing.m,
    },
    walletDetails: {
      flexDirection: 'row',
    },
    walletIcon: {
      backgroundColor: theme.color.primary100,
      borderRadius: theme.roundness.l,
      padding: theme.spacing.s,
      marginRight: theme.spacing.sm,
    },
    walletLabel: {
      fontFamily: theme.fontFamily.semibold,
      color: theme.color.primary300,
      fontSize: theme.fontSize.s,
      lineHeight: theme.fontSize.s * 1.5,
    },
    walletAmount: {
      fontFamily: theme.fontFamily.bold,
      color: theme.color.primary,
      fontSize: theme.fontSize.sl,
      lineHeight: theme.fontSize.sl * 1.3,
    },
  })

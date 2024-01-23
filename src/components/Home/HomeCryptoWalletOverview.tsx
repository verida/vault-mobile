import { useNavigation } from '@react-navigation/native'
import { Icon, Typography } from 'components'
import { useTheme } from 'contexts'
import {
  getUniqueWalletAddresses,
  getWallets,
  useGetBalancesQuery,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { Pressable, StyleSheet, View, ViewProps } from 'react-native'
import { useSelector } from 'react-redux'

import { NumericFiat } from 'components/Span'
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
            <Typography variant='label' style={styles.walletLabel}>
              {displayedLabel}
            </Typography>
            <Typography variant='h4' style={styles.walletValue}>
              <NumericFiat value={total || 0} />
            </Typography>
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
      color: theme.color.primary300,
    },
    walletValue: {
      color: theme.color.primary,
    },
  })

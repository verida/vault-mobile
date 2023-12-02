import { useNavigation } from '@react-navigation/native'
import {
  getAggregateWalletBannerBalanceResult,
  useAggregateWalletBannerBalances,
  useAggregateWalletBannerBalancesValuation,
} from 'features/cryptoWallet'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import ChevronRightPrimaryIcon from 'assets/icons/chevron_right_primary.svg'
import MainWallet from 'assets/icons/main_wallet.svg'
import { NumericFiatWithAccuracy } from 'components/Span'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'

import {
  PRIMARY_COLOR_100,
  PRIMARY_COLOR_200,
  PRIMARY_COLOR_300,
  PRIMARY_COLOR_500,
} from '../../../constants/color'

const WalletSummary = () => {
  const { price, isAccurate, currency } =
    useAggregateWalletBannerBalancesValuation({
      aggregateWalletBannerBalances: getAggregateWalletBannerBalanceResult(
        useAggregateWalletBannerBalances()
      ),
    })

  const navigation = useNavigation()

  const handlePress = React.useCallback(
    () => navigation.navigate('Assets'),
    [navigation]
  )

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.walletDetails}>
        <View style={styles.walletIcon}>
          <MainWallet />
        </View>
        <View>
          <Text style={styles.walletLabel}>All wallets</Text>
          <Text style={styles.walletAmount}>
            <NumericFiatWithAccuracy
              currency={currency}
              value={price}
              isAccurate={isAccurate}
            />
          </Text>
        </View>
      </View>
      <View>
        <ChevronRightPrimaryIcon />
      </View>
    </Pressable>
  )
}

export default WalletSummary

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PRIMARY_COLOR_200,
    borderRadius: 4,
    padding: 16,
  },
  walletIcon: {
    backgroundColor: PRIMARY_COLOR_100,
    borderRadius: 12,
    marginRight: 12,
    padding: 8,
  },
  walletLabel: {
    fontFamily: NUNITO_SANS,
    color: PRIMARY_COLOR_300,
    fontSize: 12,
    lineHeight: 18,
  },
  walletAmount: {
    fontFamily: NUNITO_SANS_BOLD,
    color: PRIMARY_COLOR_500,
    fontSize: 17,
    lineHeight: 22.1,
  },
  walletDetails: {
    flexDirection: 'row',
  },
})

import { useNavigation } from '@react-navigation/native'
import { CryptoWalletValueBanner } from 'components'
import {
  AggregateWalletBannerBalance,
  useAggregateWalletBannerBalancesValuation,
  useAggregateWalletBannerBalancesWithResultCaching,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ErrorBoundary } from 'components/ErrorBoundary'
import { TokensList } from 'components/Tokens/TokensList'
import { Theme } from 'styles/types'

export const TokenDashboard: React.FC = () => {
  const navigation = useNavigation()
  const styles = useThemeAwareStyle(createStyles)

  const cachedAggregateWalletBannerBalances =
    useAggregateWalletBannerBalancesWithResultCaching()

  const {
    loading,
    result: aggregateWalletBannerBalances,
    refetch: pullToRefresh,
    error,
  } = cachedAggregateWalletBannerBalances

  const { price: walletValue, currency } =
    useAggregateWalletBannerBalancesValuation({
      aggregateWalletBannerBalances,
    })

  return (
    <ErrorBoundary>
      <View style={styles.contentContainer}>
        <View style={styles.walletValueBannerWrapper}>
          <CryptoWalletValueBanner value={walletValue} unit={currency} />
        </View>
        <TokensList
          aggregateWalletBannerBalances={aggregateWalletBannerBalances}
          onPressItem={({
            resource,
            label: title,
          }: AggregateWalletBannerBalance) => {
            navigation.navigate('SingleCurrency', {
              resource,
              title,
            })
          }}
          onPullToRefresh={pullToRefresh}
          refreshing={loading}
          error={error}
        />
      </View>
    </ErrorBoundary>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
    },
    walletValueBannerWrapper: {
      marginHorizontal: theme.spacing.m,
      marginBottom: theme.spacing.sm,
    },
  })

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
import LoadingIndicator from 'components/LoadingIndicator'
import { TokensList } from 'components/Tokens/TokensList'
import { useMainNavigation } from 'navigation/hooks'
import { Theme } from 'styles/types'

export const TokenDashboard: React.FC = () => {
  const navigation = useMainNavigation()
  const styles = useThemeAwareStyle(createStyles)

  const cachedAggregateWalletBannerBalances =
    useAggregateWalletBannerBalancesWithResultCaching()

  const {
    loading,
    result: aggregateWalletBannerBalances,
    refetch: pullToRefresh,
    error: maybeError,
  } = cachedAggregateWalletBannerBalances

  const [wasInitiallyLoading] = React.useState<boolean>(loading)

  const shouldShowLoadingIndicator = wasInitiallyLoading && loading

  const { price: walletValue, currency } =
    useAggregateWalletBannerBalancesValuation({
      aggregateWalletBannerBalances,
    })

  return (
    <ErrorBoundary>
      {shouldShowLoadingIndicator || maybeError ? (
        <LoadingIndicator />
      ) : (
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
          />
        </View>
      )}
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

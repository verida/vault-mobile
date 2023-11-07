import {
  AggregateWalletBannerBalance,
  AggregateWalletBannerBalances,
  getAggregateWalletBannerBalanceError,
  getAggregateWalletBannerBalanceResult,
  useAggregateWalletBannerBalances,
  useAggregateWalletBannerBalancesValuation,
} from 'features/cryptoWallet'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import useDeepCompareEffect from 'use-deep-compare-effect'

import Container from 'components/Container'
import { ErrorBoundary } from 'components/ErrorBoundary'
import LoadingIndicator from 'components/LoadingIndicator'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'
import { useMainNavigation } from 'navigation/hooks'

import SendListModal from './SendListModal'

// HACK: Loading the wallet banner balances can impact the content
//       what's rendered in the list, for example, balances can
//       temporarily turn to `0` since they are in the loading state
//       and this is a safe fallback for the temporarily invalidated
//       information.
//
//       Here, we ensure that the state is cached whilst unavailable
//       to ensure the interface remains stable.
function useAggregateWalletBannerBalancesCached() {
  const aggregateWalletBannerBalances = useAggregateWalletBannerBalances()

  const { loading } = aggregateWalletBannerBalances

  const currentError = getAggregateWalletBannerBalanceError(
    aggregateWalletBannerBalances
  )

  const currentResult = getAggregateWalletBannerBalanceResult(
    aggregateWalletBannerBalances
  )

  const [cachedResult, setCachedResult] =
    React.useState<AggregateWalletBannerBalances>(currentResult)

  useDeepCompareEffect(() => {
    if (loading) return

    setCachedResult(currentResult)
  }, [currentResult, loading])

  return {
    ...aggregateWalletBannerBalances,
    loading,
    result: cachedResult,
    error: currentError,
  }
}

const TokenDashboard = React.memo(function TokenDashboard() {
  const [sendModalVisible, setSendModalVisible] = useState(false)

  const navigation = useMainNavigation()

  const cachedAggregateWalletBannerBalances =
    useAggregateWalletBannerBalancesCached()

  const {
    loading,
    result: aggregateWalletBannerBalances,
    refetch: pullToRefresh,
    error: maybeError,
  } = cachedAggregateWalletBannerBalances

  const [wasInitiallyLoading] = React.useState<boolean>(loading)

  const shouldShowLoadingIndicator = wasInitiallyLoading && loading

  const { price } = useAggregateWalletBannerBalancesValuation({
    aggregateWalletBannerBalances,
  })

  return (
    <Container>
      <ErrorBoundary>
        {shouldShowLoadingIndicator || maybeError ? (
          <LoadingIndicator />
        ) : (
          <View style={styles.contentContainer}>
            <TestnetWarning networkReference={null} />
            <TokenBanner
              // TODO: Implement me (is this supposed to be the user's sum balance change???)
              conversionRate={null}
              // TODO: Implement me
              tokenType={null}
              totalBalance={price}
              showControls={false}
              symbol={null}
              isSumOfMultipleBalances
              icon={null}
              tokenBalance={null}
              decimals={null}
              change={null}
            />
            <TokensList
              aggregateWalletBannerBalances={aggregateWalletBannerBalances}
              onPressItem={(
                aggregateWalletBannerBalance: AggregateWalletBannerBalance
              ) => {
                navigation.navigate('SingleCurrency', {
                  aggregateWalletBannerBalance,
                })
              }}
              onPullToRefresh={pullToRefresh}
              refreshing={loading}
            />
            <SendListModal
              visible={sendModalVisible}
              hideModal={() => setSendModalVisible(false)}
              aggregateWalletBannerBalances={aggregateWalletBannerBalances}
              onPressItem={(
                aggregateWalletBannerBalance: AggregateWalletBannerBalance
              ) => {
                setSendModalVisible(false)
                navigation.navigate('SendToken', {
                  aggregateWalletBannerBalance,
                })
              }}
            />
          </View>
        )}
      </ErrorBoundary>
    </Container>
  )
})

const styles = StyleSheet.create({
  contentContainer: { flex: 1, marginTop: 10 },
})

export default TokenDashboard

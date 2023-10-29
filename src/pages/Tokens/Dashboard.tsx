import {
  AggregateWalletBannerBalance,
  getAggregateWalletBannerBalanceResult,
  useAggregateWalletBannerBalances,
  useAggregateWalletBannerBalancesValuation,
} from 'features/cryptoWallet'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import Container from 'components/Container'
import { ErrorBoundary } from 'components/ErrorBoundary'
import LoadingIndicator from 'components/LoadingIndicator'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'
import { useMainNavigation } from 'navigation/hooks'

import SendListModal from './SendListModal'

const TokenDashboard = React.memo(function TokenDashboard() {
  const [sendModalVisible, setSendModalVisible] = useState(false)

  const navigation = useMainNavigation()

  const aggregateWalletBannerBalances = useAggregateWalletBannerBalances()
  const { loading, refetch: pullToRefresh } = aggregateWalletBannerBalances
  const [wasInitiallyLoading] = React.useState<boolean>(loading)

  const shouldShowLoadingIndicator = wasInitiallyLoading && loading

  const { price } = useAggregateWalletBannerBalancesValuation(
    aggregateWalletBannerBalances
  )

  // TODO: refactor this object so that it respects fiat equivalent values may not be accurate
  const data = React.useMemo(() => ({ amount: price }), [price])

  return (
    <Container>
      <ErrorBoundary>
        {shouldShowLoadingIndicator ? (
          <LoadingIndicator />
        ) : (
          <View style={styles.contentContainer}>
            <TestnetWarning networkReference={null} />
            <TokenBanner data={data} />
            <TokensList
              aggregateWalletBannerBalances={getAggregateWalletBannerBalanceResult(
                aggregateWalletBannerBalances
              )}
              onPressItem={(item: AggregateWalletBannerBalance) => {
                navigation.navigate('SingleCurrency', { item })
              }}
              onPullToRefresh={pullToRefresh}
              refreshing={loading}
            />
            <SendListModal
              visible={sendModalVisible}
              hideModal={() => setSendModalVisible(false)}
              aggregateWalletBannerBalances={getAggregateWalletBannerBalanceResult(
                aggregateWalletBannerBalances
              )}
              onPressItem={(token: AggregateWalletBannerBalance) => {
                setSendModalVisible(false)
                navigation.navigate('SendToken', { token })
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

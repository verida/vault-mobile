import { useNavigation } from '@react-navigation/native'
import {
  AggregateWalletBannerBalance,
  useAggregateWalletBannerBalancesValuation,
  useAggregateWalletBannerBalancesWithResultCaching,
} from 'features/cryptoWallet'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import Container from 'components/Container'
import { ErrorBoundary } from 'components/ErrorBoundary'
import LoadingIndicator from 'components/LoadingIndicator'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'

import SendListModal from './SendListModal'

const TokenDashboard = React.memo(function TokenDashboard() {
  const [sendModalVisible, setSendModalVisible] = useState(false)

  const navigation = useNavigation()

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
              valuation={null}
              tokenType={null}
              totalBalance={price}
              showControls={false}
              symbol={null}
              isSumOfMultipleBalances
              icon={null}
              tokenBalance={null}
              decimals={null}
            />
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

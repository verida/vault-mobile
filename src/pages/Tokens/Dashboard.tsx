import {
  BalanceByChainResult,
  isBalanceByChainResult,
  useWalletBannerBalance,
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

  const {
    list: maybeList,
    total = 0,
    isLoading,
    isFetching,
    refetch: pullToRefresh,
  } = useWalletBannerBalance()

  const list = React.useMemo<readonly BalanceByChainResult[]>(() => {
    if (!maybeList) return []

    return maybeList.flatMap((e) => (isBalanceByChainResult(e) ? [e] : []))
  }, [maybeList])

  const data = React.useMemo(() => ({ amount: total }), [total])

  return (
    <Container>
      <ErrorBoundary>
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <View style={styles.contentContainer}>
            <TestnetWarning networkReference={null} />
            <TokenBanner data={data} />
            <TokensList
              list={list}
              onPressItem={(item: BalanceByChainResult) =>
                navigation.navigate('SingleCurrency', { item })
              }
              onPullToRefresh={() => pullToRefresh()}
              refreshing={isFetching}
            />
            <SendListModal
              visible={sendModalVisible}
              hideModal={() => setSendModalVisible(false)}
              list={list}
              onPressItem={(token: BalanceByChainResult) => {
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

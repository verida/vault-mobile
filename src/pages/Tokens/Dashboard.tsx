import {
  SelectSingleTokenData,
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
    total,
    isLoading,
    isFetching,
    refetch: pullToRefresh,
  } = useWalletBannerBalance()

  return (
    <Container>
      <ErrorBoundary>
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <View style={styles.contentContainer}>
            <TestnetWarning networkReference={null} />
            <TokenBanner
              data={{
                amount: total || 0,
              }}
            />
            <TokensList
              list={maybeList}
              onPressItem={(item) =>
                navigation.navigate('SingleCurrency', { item })
              }
              onPullToRefresh={() => pullToRefresh()}
              refreshing={isFetching}
            />
            <SendListModal
              visible={sendModalVisible}
              hideModal={() => setSendModalVisible(false)}
              list={maybeList}
              onPressItem={(token: SelectSingleTokenData) => {
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

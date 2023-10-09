import { useNavigation } from '@react-navigation/native'
import { useWalletBannerBalance } from 'features/cryptoWallet'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import Container from 'components/Container'
import { ErrorBoundary } from 'components/ErrorBoundary'
import LoadingIndicator from 'components/LoadingIndicator'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'

import SendListModal from './SendListModal'

const TokenDashboard = () => {
  const [sendModalVisible, setSendModalVisible] = useState(false)
  const navigation = useNavigation()

  const {
    list,
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
                amount: total,
              }}
            />
            <TokensList
              list={list}
              onPressItem={(item) =>
                navigation.navigate('SingleCurrency', { item })
              }
              onPullToRefresh={() => pullToRefresh()}
              refreshing={isFetching}
            />
            <SendListModal
              visible={sendModalVisible}
              hideModal={() => setSendModalVisible(false)}
              list={list}
              onPressItem={() => {
                setSendModalVisible(false)
                navigation.navigate('SendToken')
              }}
            />
          </View>
        )}
      </ErrorBoundary>
    </Container>
  )
}

const styles = StyleSheet.create({
  contentContainer: { flex: 1, marginTop: 10 },
})

export default TokenDashboard

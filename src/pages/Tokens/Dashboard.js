import { useNavigation } from '@react-navigation/native'
import {
  getUniqueWalletAddresses,
  getWallets,
  useGetBalancesQuery,
} from 'features/wallets'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

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

  const wallets = useSelector(getWallets)
  const addresses = getUniqueWalletAddresses(wallets)

  const { data, isLoading, isFetching, refetch } =
    useGetBalancesQuery(addresses)

  async function pullToRefresh() {
    refetch()
  }

  const { list, total } = data || {}

  return (
    <Container withLoadingView showLoading={!isLoading && isFetching}>
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
              refreshing={isLoading}
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

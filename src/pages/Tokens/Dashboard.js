import { useNavigation } from '@react-navigation/native'
import {
  getAllWallets,
  getSelectedWalletId,
  getUniqueWalletAddresses,
  useGetBalancesQuery,
} from 'features/wallets'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

import Container from 'components/Container'
import LoadingIndicator from 'components/LoadingIndicator'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'

import SendListModal from './SendListModal'

const TokenDashboard = () => {
  const [sendModalVisible, setSendModalVisible] = useState(false)
  const navigation = useNavigation()

  const selectedWalletId = useSelector(getSelectedWalletId)
  const wallets = useSelector(getAllWallets)

  const selectedWallet = wallets[selectedWalletId]
  const addresses = getUniqueWalletAddresses(selectedWallet)

  const { data, isLoading, isFetching, error, refetch } =
    useGetBalancesQuery(addresses)

  async function pullToRefresh() {
    // onGetBalances()
    refetch()
  }

  // useEffect(() => {
  //   async function loadData() {
  //     // onGetBalances()
  //   }

  //   loadData()
  // }, [onGetBalances, wallets])

  // const { loading, listAndTotal } = data2 || { listAndTotal: {} }

  const { list, total } = data || {}

  return (
    <Container withLoadingView showLoading={!isLoading && isFetching}>
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
    </Container>
  )
}

const styles = StyleSheet.create({
  contentContainer: { flex: 1, marginTop: 10 },
})

export default TokenDashboard

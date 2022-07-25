import { Container } from 'native-base'
import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import SettingsSvg from 'assets/icons/settings.svg'
import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'
import { getBalances } from 'reduxStore/wallet/actions'
import { getTokensData, getWalletsData } from 'reduxStore/wallet/selectors'

import SendListModal from './SendListModal'

const TokenDashboard = ({ navigation, onGetBalances, data, wallets }) => {
  const [sendModalVisible, setSendModalVisible] = useState(false)

  async function pullToRefresh() {
    onGetBalances()
  }

  useEffect(() => {
    async function loadData() {
      onGetBalances()
    }

    loadData()
  }, [onGetBalances, wallets])

  const { loading, listAndTotal } = data

  const { list, total } = listAndTotal

  return (
    <Container>
      <NavigationHeader
        left={{ icon: 'skip' }}
        title='Tokens'
        right={{
          icon: <SettingsSvg />,
          action: () => navigation.navigate('ManageWallets'),
        }}
      />
      {loading ? (
        <LoadingIndicator />
      ) : (
        <View style={styles.contentContainer}>
          <TestnetWarning networkReference='' />
          <TokenBanner
            data={{
              amount: total,
            }}
            // sendButtonAction={() => setSendModalVisible(true)}
            // buyButtonAction={() => navigation.navigate('BuyToken')}
            // receiveButtonAction={() => navigation.navigate('ReceiveToken')}
          />
          <TokensList
            list={list}
            onPressItem={(item) =>
              navigation.navigate('SingleCurrency', { item })
            }
            onPullToRefresh={() => pullToRefresh()}
            refreshing={loading}
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
  contentContainer: { flex: 1 },
})

const mapStateToProps = (rootState) => {
  const state = rootState.main
  return {
    wallets: getWalletsData(state),
    data: getTokensData(rootState),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onGetBalances: () => dispatch(getBalances()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TokenDashboard)

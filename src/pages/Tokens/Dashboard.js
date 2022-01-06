import React, { useState, useEffect } from 'react'
import { Container } from 'native-base'
import { connect } from 'react-redux'
import { View } from 'react-native'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'
import LoadingIndicator from 'components/LoadingIndicator'
import SendListModal from './SendListModal'

import SettingsSvg from 'assets/icons/settings.svg'

import { getPrices, getBalances } from 'reduxStore/wallet/actions'
import { getTokensData } from 'reduxStore/wallet/selectors'

const TokenDashboard = ({ navigation, getPrices, getBalances, data }) => {
  const [sendModalVisible, setSendModalVisible] = useState(false)

  function pullToRefresh() {
    getBalances()
    getPrices()
  }

  useEffect(() => {
    async function loadData() {
      getBalances()
      getPrices()
    }

    loadData()
  }, [])

  const { loading, listAndTotal } = data

  const { list, total } = listAndTotal

  return (
    <Container>
      <NavigationHeader
        left={{ icon: 'skip' }}
        title='Tokens'
        right={{
          icon: <SettingsSvg />,
        }}
      />
      {loading ? (
        <LoadingIndicator />
      ) : (
        <View>
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

const mapStateToProps = (state) => {
  return {
    data: getTokensData(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getPrices: () => dispatch(getPrices()),
    getBalances: () => dispatch(getBalances()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TokenDashboard)

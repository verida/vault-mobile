import React, { useState, useEffect } from 'react'
import { Container } from 'native-base'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'
import SendListModal from './SendListModal'

import SettingsSvg from 'assets/icons/settings.svg'

import { getPrices, getBalances, getWallets } from 'reduxStore/wallet/actions'
import { getListAndTotal } from 'reduxStore/wallet/selectors'

const TokenDashboard = ({
  navigation,
  getPrices,
  getBalances,
  listAndTotal,
}) => {
  const [sendModalVisible, setSendModalVisible] = useState(false)
  useEffect(() => {
    async function loadData() {
      getBalances()
      getPrices()
    }

    loadData()
  }, [])

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
        onPressItem={(item) => navigation.navigate('SingleCurrency', { item })}
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
    </Container>
  )
}

const mapStateToProps = (state) => {
  return {
    listAndTotal: getListAndTotal(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getPrices: () => dispatch(getPrices()),
    getBalances: () => dispatch(getBalances()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TokenDashboard)

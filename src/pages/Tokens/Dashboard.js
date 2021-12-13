import React, { useState, useEffect } from 'react'
import { Container, List } from 'native-base'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'
import SendListModal from './SendListModal'

import SettingsSvg from 'assets/icons/settings.svg'

import EthereumSvg from 'assets/wallets/Ethereum.svg'
import AlgorandSvg from 'assets/wallets/Algorand.svg'
import IKIGAISvg from 'assets/wallets/IKIGAI.svg'
import NearSvg from 'assets/wallets/Near.svg'

import { SUPPORTED_TOKENS } from 'wallet/constants'

import { getCurrencies } from 'reduxStore/wallet/actions'
import { getPricing, getList } from 'reduxStore/wallet/selectors'

const bannerData = {
  amount: 1509.09,
}

const TokenDashboard = ({ navigation, getCurrencies, pricing, list }) => {
  const [sendModalVisible, setSendModalVisible] = useState(false)
  useEffect(() => {
    async function loadData() {
      await getCurrencies()
    }

    loadData()
  }, [])

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
        data={bannerData}
        sendButtonAction={() => setSendModalVisible(true)}
        buyButtonAction={() => navigation.navigate('BuyToken')}
        receiveButtonAction={() => navigation.navigate('ReceiveToken')}
      />
      <List>
        <TokensList
          list={list}
          onPressItem={() => navigation.navigate('SingleCurrency')}
        />
      </List>
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
  return { pricing: getPricing(state), list: getList(state) }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getCurrencies: () => dispatch(getCurrencies()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TokenDashboard)

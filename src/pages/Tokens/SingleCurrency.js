import React, { useEffect, useState } from 'react'
import { Container, Icon } from 'native-base'
import { connect } from 'react-redux'
import Clipboard from '@react-native-community/clipboard'
import Toast from 'react-native-root-toast'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenBanner from 'components/Tokens/TokenBanner'
import LoadingIndicator from 'components/LoadingIndicator'
import TransactionsList from 'components/Tokens/TransactionsList'

import {
  getTransactionsForToken,
  getPrices,
  getBalances,
} from 'reduxStore/wallet/actions'
import {
  selectTransactionsData,
  selectSingleTokenData,
  getWalletsData,
} from 'reduxStore/wallet/selectors'

const SingleCurrency = ({
  navigation,
  route,
  getTransactionsForToken,
  transactions,
  tokenData,
  getBalances,
  getPrices,
  wallets,
}) => {
  const { item } = route.params
  const { list, loading } = transactions
  const address = wallets.algo.address

  function pullToRefresh() {
    getTransactionsForToken(item.address)
    getBalances()
    getPrices()
  }

  useEffect(() => {
    async function loadData() {
      getTransactionsForToken(item.address)
    }

    loadData()
  }, [])

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={item.label}
      />
      <TokenBanner
        data={tokenData}
        receiveButtonAction={() =>
          navigation.navigate('ReceiveToken', { token: tokenData })
        }
        sendButtonAction={() =>
          navigation.navigate('SendToken', { token: tokenData })
        }
        copyButtonAction={() => {
          Clipboard.setString(address)
          Toast.show('Address copied', {
            duration: Toast.durations.LONG,
            position: -130,
            shadow: false,
            animation: true,
            hideOnPress: true,
            delay: 0,
            backgroundColor: 'rgba(4, 17, 51, 1)',
          })
        }}
      />
      {loading ? (
        <LoadingIndicator />
      ) : (
        <TransactionsList
          symbol={item.symbol}
          onPullToRefresh={() => pullToRefresh()}
          refreshing={loading}
          list={list}
        />
      )}
    </Container>
  )
}

const mapStateToProps = (state, props) => {
  return {
    transactions: selectTransactionsData(
      state,
      props.route.params.item.address
    ),
    tokenData: selectSingleTokenData(state, props.route.params.item.address),
    wallets: getWalletsData(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getTransactionsForToken: (assetID) =>
      dispatch(getTransactionsForToken(assetID)),
    getPrices: () => dispatch(getPrices()),
    getBalances: () => dispatch(getBalances()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleCurrency)

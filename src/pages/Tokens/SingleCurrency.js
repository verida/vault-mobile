import React, { useEffect, useState } from 'react'
import { Container, Icon } from 'native-base'
import { connect } from 'react-redux'

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
} from 'reduxStore/wallet/selectors'

const SingleCurrency = ({
  navigation,
  route,
  getTransactionsForToken,
  transactions,
  tokenData,
  getBalances,
  getPrices,
}) => {
  const { item } = route.params
  const { list, loading } = transactions

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
    transactions: selectTransactionsData(state),
    tokenData: selectSingleTokenData(state, props.route.params.item.address),
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

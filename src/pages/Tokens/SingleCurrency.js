import React, { useEffect, useState } from 'react'
import { Container, Icon } from 'native-base'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenBanner from 'components/Tokens/TokenBanner'
import LoadingIndicator from 'components/LoadingIndicator'
import TransactionsList from 'components/Tokens/TransactionsList'

import { getTransactionsForToken } from 'reduxStore/wallet/actions'
import { selectTransactionsData } from 'reduxStore/wallet/selectors'

const SingleCurrency = ({
  navigation,
  route,
  getTransactionsForToken,
  transactions,
}) => {
  const { item } = route.params
  const { list, loading } = transactions

  function pullToRefresh() {
    getTransactionsForToken(item.address)
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
        data={item}
        receiveButtonAction={() =>
          navigation.navigate('ReceiveToken', { token: item })
        }
        sendButtonAction={() =>
          navigation.navigate('SendToken', { token: item })
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

const mapStateToProps = (state) => {
  return {
    transactions: selectTransactionsData(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getTransactionsForToken: (assetID) =>
      dispatch(getTransactionsForToken(assetID)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleCurrency)

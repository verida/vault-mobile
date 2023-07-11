import Clipboard from '@react-native-community/clipboard'
import { ChainId } from 'caip'
import { Container, Icon } from 'native-base'
import React, { useEffect } from 'react'
import Toast from 'react-native-root-toast'
import { connect } from 'react-redux'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TransactionsList from 'components/Tokens/TransactionsList'
import {
  getBlockchainNetwork,
  getBlockchainNetworkLabel,
} from 'reduxStore/selectors'
import { getBalances, getTransactionsForToken } from 'reduxStore/wallet/actions'
import {
  getSelectedWalletById,
  getWalletsData,
  selectSingleTokenData,
  selectTransactionsData,
} from 'reduxStore/wallet/selectors'

const SingleCurrency = ({
  navigation,
  route,
  onGetTransactionsForToken,
  transactions,
  tokenData,
  onGetBalances,
  blockchainNetwork,
  wallets,
  selectedWallet,
}) => {
  const { item } = route.params
  const { list, loading, errorType } = transactions

  const chainId = new ChainId(item.asset.chainId).toString()
  const address = wallets[chainId].address

  function pullToRefresh() {
    onGetTransactionsForToken(item)
    onGetBalances()
  }

  useEffect(() => {
    async function loadData() {
      onGetTransactionsForToken(item)
    }

    loadData()
  }, [onGetTransactionsForToken, item])

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={item.label}
      />
      <TestnetWarning
        networkReference={getBlockchainNetworkLabel(blockchainNetwork)}
      />
      <TokenBanner
        data={tokenData}
        selectedWallet={selectedWallet}
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
          decimal={item.decimal ? item.decimal : blockchainNetwork.decimal}
          blockchainNetwork={blockchainNetwork}
          token={item}
          onPullToRefresh={() => pullToRefresh()}
          refreshing={loading}
          errorType={errorType}
          list={list}
        />
      )}
    </Container>
  )
}

const mapStateToProps = (rootState, props) => {
  const state = rootState.main

  return {
    transactions: selectTransactionsData(state, props.route.params.item.asset),
    tokenData: selectSingleTokenData(rootState, props.route.params.item.asset),
    wallets: getWalletsData(state),
    selectedWallet: getSelectedWalletById(state),
    blockchainNetwork: getBlockchainNetwork(
      rootState,
      props.route.params.item.asset.chainId
    ),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onGetTransactionsForToken: (token) =>
      dispatch(getTransactionsForToken(token)),
    onGetBalances: () => dispatch(getBalances()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleCurrency)

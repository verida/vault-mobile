import React, { useEffect } from 'react'
import { Container, Icon } from 'native-base'
import { connect } from 'react-redux'
import { Alert } from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import Toast from 'react-native-root-toast'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenBanner from 'components/Tokens/TokenBanner'
import LoadingIndicator from 'components/LoadingIndicator'
import TransactionsList from 'components/Tokens/TransactionsList'
import { getTokenChain, isNativeToken } from 'wallet/helpers/tokens'
import { sendTransaction } from 'reduxStore/wallet/actions'

import {
  getTransactionsForToken,
  getPrices,
  getBalances,
} from 'reduxStore/wallet/actions'
import {
  selectTransactionsData,
  selectSingleTokenData,
  getWalletsData,
  selectNativeTokenBalance,
} from 'reduxStore/wallet/selectors'
import { TouchableOpacity, Text } from 'react-native'
import { WARNING_COLOR } from 'constants/color'

const SingleCurrency = ({
  navigation,
  route,
  onGetTransactionsForToken,
  transactions,
  tokenData,
  onGetBalances,
  onGetPrices,
  wallets,
  onSendTransaction,
  nativeTokenBalance,
}) => {
  const { item } = route.params
  const { list, loading } = transactions
  const tokenChain = getTokenChain(item.address)
  const address =
    tokenChain === 'algorand' ? wallets.algo.address : wallets.ethr.address

  function pullToRefresh() {
    onGetTransactionsForToken(item.address)
    onGetBalances()
    onGetPrices()
  }

  useEffect(() => {
    async function loadData() {
      onGetTransactionsForToken(item.address)
    }

    loadData()
  }, [onGetTransactionsForToken, item])

  const warningRequired =
    getTokenChain(item.address) === 'algorand' && !isNativeToken(item.address)

  const showAlert = () =>
    Alert.alert('Not enough balance', 'You need to have at least 0.001 ALGO')

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={item.label}
      />
      {warningRequired && loading === false && list.length === 0 && (
        <TouchableOpacity
          style={{
            backgroundColor: WARNING_COLOR,
            padding: 15,
            marginHorizontal: 15,
            borderRadius: 5,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => {
            if (nativeTokenBalance >= 0.001) {
              onSendTransaction(
                { token: item, amount: 0, address: address },
                true
              )
            } else {
              showAlert()
            }
          }}>
          <Icon name='warning' style={{ color: '#fff', marginRight: 10 }} />
          <Text style={{ color: '#FFF', flex: 1 }}>
            Algorand network requires a special transaction to enable receiving
            of non native assets, tap to enable {item.symbol} transactions (Fee:
            0.001 ALGO).
          </Text>
        </TouchableOpacity>
      )}
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
          decimal={item.decimal}
          tokenAddress={item.address}
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
    nativeTokenBalance: selectNativeTokenBalance(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onGetTransactionsForToken: (assetID) =>
      dispatch(getTransactionsForToken(assetID)),
    onGetPrices: () => dispatch(getPrices()),
    onGetBalances: () => dispatch(getBalances()),
    onSendTransaction: (params, isAssetEnablingTransaction) =>
      dispatch(sendTransaction(params, isAssetEnablingTransaction)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleCurrency)

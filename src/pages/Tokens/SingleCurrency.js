import Clipboard from '@react-native-community/clipboard'
import { ChainId } from 'caip'
import {
  getBlockchainNetwork,
  getBlockchainNetworkLabel,
  getSelectedWalletById,
  getWalletsData,
  selectNativeTokenBalance,
  selectSingleTokenData,
  selectTransactions,
  sendTransaction,
  useGetTransactionsForTokenQuery,
} from 'features/wallets'
import { Icon } from 'native-base'
import React from 'react'
import { Alert, Text, TouchableOpacity } from 'react-native'
import Toast from 'react-native-root-toast'
import { connect, useSelector } from 'react-redux'
import { isNativeToken } from 'wallet/helpers/tokens'

import Container from 'components/Container'
import { ErrorFallbackCard } from 'components/Errors'
import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TransactionsList from 'components/Tokens/TransactionsList'
import { WARNING_COLOR } from 'constants/color'

const SingleCurrency = ({ navigation, route, onSendTransaction }) => {
  const { item } = route.params

  const wallets = useSelector(getWalletsData)
  const selectedWallet = useSelector(getSelectedWalletById)
  const blockchainNetwork = useSelector((state) =>
    getBlockchainNetwork(state, route.params.item.asset.chainId)
  )
  const chainId = new ChainId(item.asset.chainId).toString()
  const address = wallets[chainId].address
  const nativeTokenBalance = useSelector((state) =>
    selectNativeTokenBalance(state, item)
  )

  const { isLoading, isFetching, error, refetch } =
    useGetTransactionsForTokenQuery({
      userAddress: address,
      asset: item.asset,
    })

  const list = useSelector((state) => selectTransactions(state, item.asset))
  const tokenData = useSelector((state) =>
    selectSingleTokenData(state, item.asset)
  )

  function pullToRefresh() {
    refetch()
  }

  const warningRequired =
    item.asset.chainId.namespace === 'algorand' && !isNativeToken(item.asset)

  let networkLabel = getBlockchainNetworkLabel(blockchainNetwork)

  const showAlert = () =>
    Alert.alert('Not enough balance', 'You require at least 0.001 ALGO')

  if (error)
    return (
      <ErrorFallbackCard
        error={new Error('Failed to load transactions')}
        resetErrorBoundary={refetch}
      />
    )

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={item.label}
      />
      <TestnetWarning networkReference={networkLabel} />
      {warningRequired && isLoading === false && list.length === 0 && (
        <TouchableOpacity
          style={{
            backgroundColor: WARNING_COLOR,
            padding: 15,
            marginHorizontal: 15,
            borderRadius: 5,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
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
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <TransactionsList
          symbol={item.symbol}
          decimal={item.decimal ? item.decimal : blockchainNetwork.decimal}
          blockchainNetwork={blockchainNetwork}
          token={item}
          onPullToRefresh={() => pullToRefresh()}
          refreshing={isFetching}
          // errorType={errorType}
          list={list}
        />
      )}
    </Container>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSendTransaction: (params, isAssetEnablingTransaction) =>
      dispatch(sendTransaction(params, isAssetEnablingTransaction)),
  }
}

export default connect(mapDispatchToProps)(SingleCurrency)

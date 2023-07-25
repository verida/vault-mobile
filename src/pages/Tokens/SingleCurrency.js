import Clipboard from '@react-native-community/clipboard'
import { ChainId } from 'caip'
import {
  getBlockchainNetwork,
  getBlockchainNetworkLabel,
  getSelectedWalletById,
  getWalletsData,
  selectSingleTokenData,
  selectTransactions,
  useGetTransactionsForTokenQuery,
} from 'features/cryptoWallet'
import { Icon } from 'native-base'
import React from 'react'
import Toast from 'react-native-root-toast'
import { useSelector } from 'react-redux'

import Container from 'components/Container'
import { ErrorFallbackCard } from 'components/Errors'
import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TransactionsList from 'components/Tokens/TransactionsList'

const SingleCurrency = ({ navigation, route }) => {
  const { item } = route.params

  const wallets = useSelector(getWalletsData)
  const selectedWallet = useSelector(getSelectedWalletById)
  const blockchainNetwork = useSelector((state) =>
    getBlockchainNetwork(state, route.params.item.asset.chainId)
  )
  const chainId = new ChainId(item.asset.chainId).toString()
  const address = wallets[chainId].address

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

export default SingleCurrency

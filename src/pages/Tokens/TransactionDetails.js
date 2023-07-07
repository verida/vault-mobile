import { ChainId } from 'caip'
import {
  getBlockchainNetwork,
  getBlockchainNetworkLabel,
  getWalletsData,
  useGetTransactionDetailsQuery,
} from 'features/wallets'
import { Container, Icon } from 'native-base'
import React from 'react'
import { useSelector } from 'react-redux'
import { store } from 'reduxStore'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TransactionInfo from 'components/Tokens/TransactionInfo'

const TransactionDetails = ({ navigation, route }) => {
  const { id, token } = route.params

  const wallets = useSelector(getWalletsData)
  const chainId = new ChainId(token.asset.chainId).toString()
  const address = wallets[chainId].address

  const { data: transaction, isLoading } = useGetTransactionDetailsQuery({
    transactionId: id,
    userAddress: address,
    asset: token.asset,
  })

  const network = getBlockchainNetwork(store.getState(), token.asset.chainId)
  let networkReference = getBlockchainNetworkLabel(network)

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={'Transaction Details'}
      />
      <TestnetWarning networkReference={networkReference} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <TransactionInfo transaction={transaction} token={token} />
      )}
    </Container>
  )
}

export default TransactionDetails

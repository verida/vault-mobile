import { RouteProp } from '@react-navigation/native'
import { ChainId } from 'caip'
import {
  getBlockchainNetworkLabel,
  getWalletsData,
  SupportedTokenObject,
  useGetTransactionDetailsQuery,
  useMaybeBlockchainNetwork,
} from 'features/cryptoWallet'
import { Container, Icon } from 'native-base'
import React from 'react'
import { useSelector } from 'react-redux'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TransactionInfo from 'components/Tokens/TransactionInfo'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'

export type TransactionDetailsRouteProp = RouteProp<
  MainStackParams,
  'TransactionDetails'
>

export type TransactionDetailsScreenProps = {
  readonly id: string
  readonly token: SupportedTokenObject | null | undefined
}

const TransactionDetails = () => {
  const navigation = useMainNavigation()
  const { id, token } = useParams<TransactionDetailsScreenProps>()

  const wallets = useSelector(getWalletsData)

  const maybeChainId = token?.asset?.chainId
    ? new ChainId(token.asset.chainId).toString()
    : undefined

  const address: string | undefined = maybeChainId
    ? wallets[maybeChainId].address
    : undefined

  const { data: transaction, isLoading } = useGetTransactionDetailsQuery({
    transactionId: id,
    userAddress: address || null,
    asset: token?.asset,
  })

  const network = useMaybeBlockchainNetwork(token?.asset?.chainId)
  const networkReference = getBlockchainNetworkLabel(network)

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
      {isLoading || !transaction || !token ? (
        <LoadingIndicator />
      ) : (
        <TransactionInfo transaction={transaction} token={token} />
      )}
    </Container>
  )
}

export default TransactionDetails

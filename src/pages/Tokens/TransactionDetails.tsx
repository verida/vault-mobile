import { RouteProp } from '@react-navigation/native'
import { ChainId } from 'caip'
import {
  AggregateWalletBannerBalance,
  getBlockchainNetworkLabel,
  getChainIdParamsFromResourceParams,
  getWalletAddressForChainId,
  useGetTransactionDetailsQuery,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useMaybeBlockchainNetwork,
  useSelectedMinifiedVeridaAccounts,
} from 'features/cryptoWallet'
import { Container, Icon } from 'native-base'
import React from 'react'

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
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

const TransactionDetails = () => {
  const navigation = useMainNavigation()
  const { id, aggregateWalletBannerBalance } =
    useParams<TransactionDetailsScreenProps>()

  const { resource } = aggregateWalletBannerBalance

  const selectedMinifiedAccounts = useSelectedMinifiedVeridaAccounts()
  const chainId = new ChainId(getChainIdParamsFromResourceParams(resource))

  const address = getWalletAddressForChainId(chainId, selectedMinifiedAccounts)

  const maybeAsset = useMaybeAssetIdForAggregateWalletBannerBalance({
    aggregateWalletBannerBalance,
  })

  const { data: transaction, isLoading } = useGetTransactionDetailsQuery({
    transactionId: id,
    userAddress: address || null,
    asset: maybeAsset || null,
  })

  const maybeBlockchainNetwork = useMaybeBlockchainNetwork(chainId)

  const networkReference = getBlockchainNetworkLabel(maybeBlockchainNetwork)

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
      {isLoading || !transaction || !aggregateWalletBannerBalance ? (
        <LoadingIndicator />
      ) : (
        <TransactionInfo
          transaction={transaction}
          aggregateWalletBannerBalance={aggregateWalletBannerBalance}
        />
      )}
    </Container>
  )
}

export default TransactionDetails

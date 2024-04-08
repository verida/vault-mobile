import { RouteProp } from '@react-navigation/native'
import {
  AggregateWalletBannerBalance,
  useChainIdForResourceParams,
  useGetTransactionDetailsQuery,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useSelectedWallet,
} from 'features/cryptoWallet'
import { Container, Icon } from 'native-base'
import React from 'react'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
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
  const chainId = useChainIdForResourceParams({ resource })

  const selectedWallet = useSelectedWallet()
  const accounts = selectedWallet?.accounts || []
  const account = chainId
    ? accounts.find((accountItem) => accountItem.chainId === chainId.toString())
    : undefined

  const address = account?.address || null

  const maybeAsset = useMaybeAssetIdForAggregateWalletBannerBalance({
    aggregateWalletBannerBalance,
  })

  const { data: transaction, isLoading } = useGetTransactionDetailsQuery({
    transactionId: id,
    userAddress: address || null,
    asset: maybeAsset || null,
  })

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={'Transaction Details'}
      />
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

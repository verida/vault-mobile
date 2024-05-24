import { RouteProp } from '@react-navigation/native'
import {
  AggregateWalletBannerBalance,
  useChainIdForResourceParams,
  useGetTransactionDetailsQuery,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useSelectedCryptoWallet,
} from 'features/cryptoWallet'
import { Container, Icon } from 'native-base'
import React from 'react'
import { View } from 'react-native'

import { Typography } from '~/components'

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
  const resourceChainId = useChainIdForResourceParams({ resource })

  // TODO: Factorise this as it's also implemented in ReceiveToken.tsx and SingleCurrency.tsx
  const selectedCryptoWallet = useSelectedCryptoWallet()
  const accounts = selectedCryptoWallet?.accounts || []
  const account = resourceChainId
    ? accounts.find(
        (accountItem) => accountItem.namespace === resourceChainId.namespace
      )
    : undefined

  const address = account?.address || null

  const maybeAsset = useMaybeAssetIdForAggregateWalletBannerBalance({
    aggregateWalletBannerBalance,
  })

  const { data: transaction, isError } = useGetTransactionDetailsQuery({
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
      {transaction && aggregateWalletBannerBalance ? (
        <TransactionInfo
          transaction={transaction}
          aggregateWalletBannerBalance={aggregateWalletBannerBalance}
        />
      ) : isError ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant='bodySemiBold'>
            {/* TODO: Improve the UX for errors here */}
            {`An error occured while fetching the transaction details`}
          </Typography>
        </View>
      ) : (
        <LoadingIndicator />
      )}
    </Container>
  )
}

export default TransactionDetails

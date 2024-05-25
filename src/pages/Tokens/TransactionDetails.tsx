import { RouteProp } from '@react-navigation/native'
import {
  AggregateWalletBannerBalance,
  useChainIdForResourceParams,
  useGetTransactionDetailsQuery,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useSelectedCryptoWallet,
} from 'features/cryptoWallet'
import { Container } from 'native-base'
import React from 'react'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TransactionInfo from 'components/Tokens/TransactionInfo'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'

import LeftArrowIcon from '../../assets/left_arrow_icon.svg'

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

  const { data: transaction, isLoading } = useGetTransactionDetailsQuery({
    transactionId: id,
    userAddress: address || null,
    asset: maybeAsset || null,
  })

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <LeftArrowIcon />,
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

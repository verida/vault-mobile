import {
  AggregateWalletBannerBalance,
  getWalletAddressForChainId,
  useChainIdForResourceParams,
  useGetTransactionDetailsQuery,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useMaybeChainMetadataForResource,
  useSelectedMinifiedBlockchainAccounts,
} from 'features/cryptoWallet'
import { Container, Icon } from 'native-base'
import React from 'react'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TransactionInfo from 'components/Tokens/TransactionInfo'
import { MainStackScreenProps } from 'navigation/types'

export type TransactionDetailsScreenParams = {
  readonly id: string
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

type TransactionDetailsScreenProps = MainStackScreenProps<'TransactionDetails'>

export const TransactionDetailsScreen: React.FC<TransactionDetailsScreenProps> =
  (props) => {
    const {
      navigation,
      route: { params },
    } = props

    const { id, aggregateWalletBannerBalance } = params

    const { resource } = aggregateWalletBannerBalance

    const selectedMinifiedAccounts = useSelectedMinifiedBlockchainAccounts()
    const chainId = useChainIdForResourceParams({ resource })

    const address = getWalletAddressForChainId(
      chainId,
      selectedMinifiedAccounts
    )

    const maybeAsset = useMaybeAssetIdForAggregateWalletBannerBalance({
      aggregateWalletBannerBalance,
    })

    const { data: transaction, isLoading } = useGetTransactionDetailsQuery({
      transactionId: id,
      userAddress: address || null,
      asset: maybeAsset || null,
    })

    const maybeChainMetadata = useMaybeChainMetadataForResource({ resource })

    return (
      <Container>
        <NavigationHeader
          left={{
            icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
            action: () => navigation.goBack(),
          }}
          title={'Transaction Details'}
        />
        <TestnetWarning networkReference={maybeChainMetadata?.name} />
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

import React, { useEffect } from 'react'

import { ScreenWrapper } from '~/components'
import LoadingIndicator from '~/components/LoadingIndicator'
import { TransactionInfo } from '~/components/Tokens'
import {
  AggregateWalletBannerBalance,
  getWalletAddressForChainId,
  useChainIdForResourceParams,
  useGetTransactionDetailsQuery,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useSelectedMinifiedBlockchainAccounts,
} from '~/features/cryptoWallet'
import { MainStackScreenProps } from '~/navigation/types'

export type TransactionDetailsScreenParams = {
  readonly id: string
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

type TransactionDetailsScreenProps = MainStackScreenProps<'TransactionDetails'>

export const TransactionDetailsScreen: React.FC<
  TransactionDetailsScreenProps
> = (props) => {
  const {
    navigation,
    route: { params },
  } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Transaction Details',
    })
  }, [navigation])

  const { id, aggregateWalletBannerBalance } = params

  const { resource } = aggregateWalletBannerBalance

  const selectedMinifiedAccounts = useSelectedMinifiedBlockchainAccounts()
  const chainId = useChainIdForResourceParams({ resource })

  const address = getWalletAddressForChainId(chainId, selectedMinifiedAccounts)

  const maybeAsset = useMaybeAssetIdForAggregateWalletBannerBalance({
    aggregateWalletBannerBalance,
  })

  const { data: transaction, isLoading } = useGetTransactionDetailsQuery({
    transactionId: id,
    userAddress: address || null,
    asset: maybeAsset || null,
  })

  return (
    <ScreenWrapper>
      {isLoading || !transaction || !aggregateWalletBannerBalance ? (
        <LoadingIndicator />
      ) : (
        <TransactionInfo
          transaction={transaction}
          aggregateWalletBannerBalance={aggregateWalletBannerBalance}
        />
      )}
    </ScreenWrapper>
  )
}

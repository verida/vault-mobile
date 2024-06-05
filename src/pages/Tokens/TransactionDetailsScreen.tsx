import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { ScreenWrapper, Typography } from '~/components'
import LoadingIndicator from '~/components/LoadingIndicator'
import { TransactionInfo } from '~/components/Tokens'
import {
  AggregateWalletBannerBalance,
  useChainIdForResourceParams,
  useGetTransactionDetailsQuery,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useSelectedCryptoWallet,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
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
  const resourceChainId = useChainIdForResourceParams({ resource })

  // TODO: Factorise this as it's also implemented in TransactionDetails.tsx and SingleCurrency.tsx
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

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper>
      {transaction && aggregateWalletBannerBalance ? (
        <TransactionInfo
          transaction={transaction}
          aggregateWalletBannerBalance={aggregateWalletBannerBalance}
        />
      ) : isError ? (
        <View style={styles.container}>
          <Typography variant='bodySemiBold'>
            {/* TODO: Improve the UX for errors here */}
            {`An error occured while fetching the transaction details`}
          </Typography>
        </View>
      ) : (
        <LoadingIndicator />
      )}
    </ScreenWrapper>
  )
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

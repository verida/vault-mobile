import Clipboard from '@react-native-clipboard/clipboard'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Toast from 'react-native-root-toast'

import { ScreenWrapper } from '~/components'
import { ErrorFallbackCard } from '~/components/Errors'
import { TransactionsList } from '~/components/Tokens'
import { TokenBanner } from '~/components/Tokens/TokenBanner'
import {
  getMaybeChainMetadatas,
  useChainMetadatas,
} from '~/features/blockchain'
import {
  getAggregateWalletBannerBalanceResult,
  ResourceParams,
  useAggregateWalletBannerBalances,
  useAggregateWalletBannerBalancesValuation,
  useAggregateWalletBannerBalancesWithResultCaching,
  useChainIdForResourceParams,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useSelectedCryptoWallet,
  useTransactionsForMaybeAssetId,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

export type SingleCurrencyScreenParams = {
  readonly title: string
  readonly resource: ResourceParams
}

type SingleCurrencyScreenProps = MainStackScreenProps<'SingleCurrency'>

export const SingleCurrencyScreen: React.FC<SingleCurrencyScreenProps> = (
  props
) => {
  const {
    navigation,
    route: { params },
  } = props
  // TODO: we should fetch here instead, not pass the route params
  const { resource, title } = params

  useEffect(() => {
    navigation.setOptions({
      title,
    })
  }, [navigation, title])

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const resourceChainId = useChainIdForResourceParams({ resource })

  const chain = chainMetadatas.find(
    (chainMetadata) =>
      chainMetadata.namespace === resourceChainId.namespace &&
      chainMetadata.reference === resourceChainId.reference
  )

  const [maybeAggregateWalletBannerBalance] =
    getAggregateWalletBannerBalanceResult(
      useAggregateWalletBannerBalances({
        resource,
      })
    )
  const assetType = useMaybeAssetIdForAggregateWalletBannerBalance({
    aggregateWalletBannerBalance: maybeAggregateWalletBannerBalance,
  })

  // TODO: Factorise this as it's also implemented in TransactionDetails.tsx and ReceiveToken.tsx
  const selectedCryptoWallet = useSelectedCryptoWallet()
  const accounts = selectedCryptoWallet?.accounts || []
  const account = resourceChainId
    ? accounts.find(
        (accountItem) => accountItem.namespace === resourceChainId.namespace
      )
    : undefined
  const address = account?.address || null

  // Here we fetch the balance for the specific selected asset, which returns
  // all assets which match the specified `resource`. Note, we could have just
  // created aggregateWalletBannerBalances simply using [aggregateWalletBannerBalance]
  // which was passed as a parameter to achieve the same effect, however, below
  // we depend on the ability fo `refetch` balances, so we'd depend on this stateful
  // hook regardless.
  const {
    result: aggregateWalletBannerBalances,
    refetch: refetchBalance,
    error: maybeErrorBalance,
  } = useAggregateWalletBannerBalancesWithResultCaching({
    resource,
  })

  const { price: value, currency } = useAggregateWalletBannerBalancesValuation({
    aggregateWalletBannerBalances,
  })

  // HACK: We'll only be returning assetIds for resources which the
  //       WalletProvider has an a-priori awareness of.
  const isAssetSupportedByWalletProvider = Boolean(assetType)

  const {
    loading: isLoadingTransactions,
    refetch: refetchTransactions,
    transactions,
    error: errorTransactions,
  } = useTransactionsForMaybeAssetId({
    assetType,
  })

  const error =
    (isAssetSupportedByWalletProvider && errorTransactions) || maybeErrorBalance

  const pullToRefresh = React.useCallback(
    // eslint-disable-next-line no-void
    () => void Promise.all([refetchTransactions(), refetchBalance()]),
    [refetchTransactions, refetchBalance]
  )

  const styles = useThemeAwareStyle(createStyles)

  if (error)
    return (
      <ErrorFallbackCard
        error={new Error('Failed to load transactions')}
        resetErrorBoundary={pullToRefresh}
      />
    )

  return (
    <ScreenWrapper safeAreaEdges={['left', 'right']}>
      <View style={styles.container}>
        <TokenBanner
          selectedWallet={selectedCryptoWallet}
          decimals={maybeAggregateWalletBannerBalance?.decimals}
          tokenBalance={maybeAggregateWalletBannerBalance?.balance}
          tokenBalanceValue={value}
          tokenBalanceValueCurrency={currency}
          valuation={maybeAggregateWalletBannerBalance?.valuation}
          symbol={maybeAggregateWalletBannerBalance?.symbol}
          icon={maybeAggregateWalletBannerBalance?.icon || undefined}
          chainLabel={chain?.name}
          chainLogo={chain?.icon || undefined}
          isChainMainnet={!!chain?.isMainnet}
          receiveButtonAction={() => {
            return navigation.navigate('ReceiveToken', {
              aggregateWalletBannerBalance: maybeAggregateWalletBannerBalance,
            })
          }}
          sendButtonAction={() => {
            return navigation.navigate('SendToken', {
              aggregateWalletBannerBalance: maybeAggregateWalletBannerBalance,
            })
          }}
          copyButtonAction={() => {
            if (!address) return

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
          style={styles.tokenBanner}
        />
        {isAssetSupportedByWalletProvider ? (
          <TransactionsList
            aggregateWalletBannerBalance={maybeAggregateWalletBannerBalance}
            onPullToRefresh={pullToRefresh}
            refreshing={isLoadingTransactions}
            list={transactions}
          />
        ) : (
          // Here, we're handling a custom asset. We could render something accordingly.
          <React.Fragment />
        )}
      </View>
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: theme.spacing.m,
      paddingTop: theme.spacing.m,
    },
    tokenBanner: {
      marginHorizontal: theme.spacing.m,
    },
  })

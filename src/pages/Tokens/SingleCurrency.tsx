import Clipboard from '@react-native-clipboard/clipboard'
import { RouteProp } from '@react-navigation/native'
import { getMaybeChainMetadatas, useChainMetadatas } from 'features/blockchain'
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
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import Toast from 'react-native-root-toast'

import Container from 'components/Container'
import { ErrorFallbackCard } from 'components/Errors'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { TokenBanner } from 'components/Tokens/TokenBanner'
import TransactionsList from 'components/Tokens/TransactionsList'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'
import { Theme } from 'styles/types'

import LeftArrowIcon from '../../assets/left_arrow_icon.svg'

export type SingleCurrencyRouteProp = RouteProp<
  MainStackParams,
  'SingleCurrency'
>

export type SingleCurrencyScreenProps = {
  readonly title: string
  readonly resource: ResourceParams
  //readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

const SingleCurrency = () => {
  const navigation = useMainNavigation()

  // TODO: we should fetch here instead, not pass the route params
  const { resource, title } = useParams<SingleCurrencyScreenProps>()

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
    <Container>
      <NavigationHeader
        left={{
          icon: <LeftArrowIcon />,
          action: () => navigation.goBack(),
        }}
        title={title}
      />
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
          if (!address) {
            return
          }

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
      {!isAssetSupportedByWalletProvider ? (
        // Here, we're handling a custom asset. We could render something accordingly.
        <React.Fragment />
      ) : (
        <TransactionsList
          aggregateWalletBannerBalance={maybeAggregateWalletBannerBalance}
          onPullToRefresh={pullToRefresh}
          refreshing={isLoadingTransactions}
          list={transactions}
        />
      )}
    </Container>
  )
}

export default SingleCurrency

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    tokenBanner: {
      margin: theme.spacing.m,
    },
  })

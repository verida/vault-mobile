import Clipboard from '@react-native-community/clipboard'
import {
  getAggregateWalletBannerBalanceResult,
  getSelectedWalletById,
  ResourceParams,
  useAggregateWalletBannerBalances,
  useAggregateWalletBannerBalancesValuation,
  useAggregateWalletBannerBalancesWithResultCaching,
  useChainIdForResourceParams,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useTransactionsForMaybeAssetId,
} from 'features/cryptoWallet'
import { Icon } from 'native-base'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import Toast from 'react-native-root-toast'
import { useSelector } from 'react-redux'

import {
  getMaybeChainMetadatas,
  useChainMetadatas,
} from '~/features/blockchain'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import Container from 'components/Container'
import { ErrorFallbackCard } from 'components/Errors'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { TokenBanner } from 'components/Tokens/TokenBanner'
import TransactionsList from 'components/Tokens/TransactionsList'
import { MainStackScreenProps } from 'navigation/types'

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

  // TODO: idk what to do about this yet
  const selectedWallet = useSelector(getSelectedWalletById)

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const chainId = useChainIdForResourceParams({ resource })

  const chain = chainMetadatas.find(
    (chainMetadata) =>
      chainMetadata.namespace === chainId.namespace &&
      chainMetadata.reference === chainId.reference
  )

  const [maybeAggregateWalletBannerBalance] =
    getAggregateWalletBannerBalanceResult(
      useAggregateWalletBannerBalances({
        resource,
      })
    )
  const assetId = useMaybeAssetIdForAggregateWalletBannerBalance({
    aggregateWalletBannerBalance: maybeAggregateWalletBannerBalance,
  })

  const accounts = Object.values(selectedWallet?.accounts || {})
  const account = chainId
    ? accounts.find((accountItem) => accountItem.chainId === chainId.toString())
    : undefined

  const maybeAddress = account?.address || null

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
  const isAssetSupportedByWalletProvider = Boolean(assetId)

  const {
    loading: isLoadingTransactions,
    refetch: refetchTransactions,
    transactions,
    error: errorTransactions,
  } = useTransactionsForMaybeAssetId({
    assetId,
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
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={title}
      />
      <TokenBanner
        selectedWallet={selectedWallet}
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
          if (!maybeAddress) return

          Clipboard.setString(maybeAddress)

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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    tokenBanner: {
      margin: theme.spacing.m,
    },
  })

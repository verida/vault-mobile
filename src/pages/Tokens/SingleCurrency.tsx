import Clipboard from '@react-native-community/clipboard'
import { RouteProp } from '@react-navigation/native'
import { ChainId } from 'caip'
import {
  AggregateWalletBannerBalance,
  getAggregateWalletBannerBalanceError,
  getAggregateWalletBannerBalanceResult,
  getBlockchainNetworkLabel,
  getChainIdParamsFromResourceParams,
  getSelectedWalletById,
  getWalletAddressForChainId,
  useAggregateWalletBannerBalances,
  useAggregateWalletBannerBalancesValuation,
  useMaybeAssetIdForAggregateWalletBannerBalance,
  useMaybeBlockchainNetwork,
  useSelectedMinifiedVeridaAccounts,
  useTransactionsForMaybeAssetId,
} from 'features/cryptoWallet'
import { Icon } from 'native-base'
import * as React from 'react'
import Toast from 'react-native-root-toast'
import { useSelector } from 'react-redux'

import Container from 'components/Container'
import { ErrorFallbackCard } from 'components/Errors'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TokenBanner from 'components/Tokens/TokenBanner'
import TransactionsList from 'components/Tokens/TransactionsList'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'

export type SingleCurrencyRouteProp = RouteProp<
  MainStackParams,
  'SingleCurrency'
>

export type SingleCurrencyScreenProps = {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

const SingleCurrency = () => {
  const navigation = useMainNavigation()

  // TODO: idk what to do about this yet
  const selectedWallet = useSelector(getSelectedWalletById)

  // TODO: we should fetch here instead, not pass the route params
  const { aggregateWalletBannerBalance } =
    useParams<SingleCurrencyScreenProps>()

  const chainId = new ChainId(
    getChainIdParamsFromResourceParams(aggregateWalletBannerBalance.resource)
  )

  //const maybeAsset: AssetId | undefined =
  //  Boolean(tokenData) && 'asset' in tokenData ? tokenData.asset : undefined

  const blockchainNetwork = useMaybeBlockchainNetwork(chainId)

  //const maybeChainId: string | undefined = maybeAsset
  //  ? new ChainId(maybeAsset.chainId).toString()
  //  : undefined

  const selectedMinifiedAccounts = useSelectedMinifiedVeridaAccounts()

  // TODO: is this right? what about multiple competing private keys for the same network?
  //const maybeAddress = wallets?.[chainId.toString()]?.address
  const maybeAddress = getWalletAddressForChainId(
    chainId,
    selectedMinifiedAccounts
  )

  const {
    symbol,
    resource,
    icon,
    balance,
    decimals,
    valuation: maybeValuation,
  } = aggregateWalletBannerBalance

  // Here we fetch the balance for the specific selected asset, which returns
  // all assets which match the specified `resource`. Note, we could have just
  // created aggregateWalletBannerBalances simply using [aggregateWalletBannerBalance]
  // which was passed as a parameter to achieve the same effect, however, below
  // we depend on the ability fo `refetch` balances, so we'd depend on this stateful
  // hook regardless.
  const aggregateWalletBannerBalances = useAggregateWalletBannerBalances({
    resource,
  })

  const { price } = useAggregateWalletBannerBalancesValuation({
    aggregateWalletBannerBalances: getAggregateWalletBannerBalanceResult(
      aggregateWalletBannerBalances
    ),
  })

  const { loading: isLoadingBalance, refetch: refetchBalance } =
    aggregateWalletBannerBalances

  const maybeErrorBalance = getAggregateWalletBannerBalanceError(
    aggregateWalletBannerBalances
  )

  const assetId = useMaybeAssetIdForAggregateWalletBannerBalance({
    aggregateWalletBannerBalance,
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

  const isLoading = isLoadingTransactions || isLoadingBalance

  const error =
    (isAssetSupportedByWalletProvider && errorTransactions) || maybeErrorBalance

  const pullToRefresh = React.useCallback(
    // eslint-disable-next-line no-void
    () => void Promise.all([refetchTransactions(), refetchBalance()]),
    [refetchTransactions, refetchBalance]
  )

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
        title={aggregateWalletBannerBalance.label}
      />
      <TestnetWarning
        networkReference={getBlockchainNetworkLabel(blockchainNetwork)}
      />
      <TokenBanner
        isSumOfMultipleBalances={false}
        decimals={decimals}
        tokenType={isAssetSupportedByWalletProvider ? null : ''}
        totalBalance={price}
        tokenBalance={balance}
        conversionRate={maybeValuation?.conversionRate || null}
        change={maybeValuation?.rates?.DAILY || null}
        showControls
        selectedWallet={selectedWallet}
        symbol={symbol}
        icon={icon}
        receiveButtonAction={() =>
          navigation.navigate('ReceiveToken', { aggregateWalletBannerBalance })
        }
        sendButtonAction={() =>
          navigation.navigate('SendToken', { aggregateWalletBannerBalance })
        }
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
      />
      {!isAssetSupportedByWalletProvider ? (
        // Here, we're handling a custom asset. We could render something accordingly.
        <React.Fragment />
      ) : (
        <TransactionsList
          blockchainNetwork={blockchainNetwork}
          aggregateWalletBannerBalance={aggregateWalletBannerBalance}
          onPullToRefresh={pullToRefresh}
          refreshing={isLoading}
          // errorType={errorType}
          list={transactions}
        />
      )}
    </Container>
  )
}

export default SingleCurrency

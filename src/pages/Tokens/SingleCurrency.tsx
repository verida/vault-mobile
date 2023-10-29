import Clipboard from '@react-native-community/clipboard'
import { RouteProp } from '@react-navigation/native'
import { ChainId } from 'caip'
import {
  AggregateWalletBannerBalance,
  getAggregateWalletBannerBalanceError,
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
import LoadingIndicator from 'components/LoadingIndicator'
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

  // TODO: we don't need this, we already have the item, fix..
  // Here we fetch the balance for the specific selected asset.
  const aggregateWalletBannerBalances = useAggregateWalletBannerBalances({
    // TODO: we need to fix this so it works for either a chainId or an asset - guessing for now this won't work
    resource,
  })

  const { price } = useAggregateWalletBannerBalancesValuation(
    aggregateWalletBannerBalances
  )

  const { loading: isLoadingBalance, refetch: refetchBalance } =
    aggregateWalletBannerBalances

  const maybeErrorBalance = getAggregateWalletBannerBalanceError(
    aggregateWalletBannerBalances
  )

  const assetId = useMaybeAssetIdForAggregateWalletBannerBalance({
    aggregateWalletBannerBalance,
  })

  const {
    loading: isLoadingTransactions,
    refetch: refetchTransactions,
    transactions,
    error: errorTransactions,
  } = useTransactionsForMaybeAssetId({
    assetId,
  })

  const isLoading = isLoadingTransactions || isLoadingBalance

  // TODO: re-enable transactions list
  const error = (false && errorTransactions) || maybeErrorBalance

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
        // TODO: Implement me
        tokenType={null}
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
      {false ? (
        <LoadingIndicator />
      ) : (
        // TODO: we will fix the transaction list in general
        <TransactionsList
          symbol={aggregateWalletBannerBalance.symbol}
          decimal={aggregateWalletBannerBalance.decimals}
          blockchainNetwork={blockchainNetwork}
          // TODO: what is a token in this instance?
          token={undefined}
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

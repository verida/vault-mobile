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
  Transaction,
  useAggregateWalletBannerBalances,
  useAggregateWalletBannerBalancesValuation,
  useGetTransactionsForTokenQuery,
  useMaybeBlockchainNetwork,
  useSelectedMinifiedVeridaAccounts,
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

  // TODO: If we store this as a verida datastore, we can save transactions
  //       on the decentralized network instead of rely on the backend to tell
  //       us what happened...
  const {
    isLoading: isLoadingTransactions,
    isFetching: isFetchingTransactions,
    error: errorTransactions,
    refetch: refetchTransactions,
  } = useGetTransactionsForTokenQuery({
    userAddress: maybeAddress || null,
    //asset: maybeAsset || null,

    // TODO: need to fix base currency asset model
    asset: null,
  })

  const { symbol, resource } = aggregateWalletBannerBalance

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

  // TODO: We need to fix maybeData to return something useful for aggregate
  //       balances -
  const data = React.useMemo(() => ({ amount: price, symbol }), [price, symbol])

  // const {
  //   maybeBalance,
  //   isLoading: isLoadingBalance,
  //   isFetching: isFetchingBalance,
  //   error: errorBalance,
  //   refetch: refetchBalance,
  // } = useMaybeBalanceForChainId(maybeAsset?.chainId)

  const isLoading = isLoadingTransactions || isLoadingBalance

  // TODO: Difference between isLoading and isFetching?
  const isFetching = isFetchingTransactions || isLoadingBalance

  // TODO: re-enable transactions list
  const error = (false && errorTransactions) || maybeErrorBalance

  const pullToRefresh = React.useCallback(() => {
    refetchTransactions()
    refetchBalance()
  }, [refetchTransactions, refetchBalance])

  // TODO: how to render transactions?
  //const list = useSelector<RootState, readonly Transaction[]>((state) =>
  //  selectTransactions(state, maybeAsset)
  //)
  //const maybeData = React.useMemo(() => maybeBalance || {}, [maybeBalance])
  const list = React.useMemo<readonly Transaction[]>(() => [], [])

  if (error)
    return (
      <ErrorFallbackCard
        error={new Error('Failed to load transactions')}
        resetErrorBoundary={pullToRefresh}
      />
    )

  //const maybeToken =
  //  Boolean(tokenData) && 'token' in tokenData ? tokenData.token : undefined

  //const maybeSymbol = maybeToken?.symbol

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
        data={data}
        selectedWallet={selectedWallet}
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
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        // TODO: we will fix the transaction list in general
        <TransactionsList
          symbol={aggregateWalletBannerBalance.symbol}
          decimal={aggregateWalletBannerBalance.decimals}
          blockchainNetwork={blockchainNetwork}
          // TODO: what is a token in this instance?
          token={undefined}
          onPullToRefresh={() => pullToRefresh()}
          refreshing={isFetching}
          // errorType={errorType}
          list={list}
        />
      )}
    </Container>
  )
}

export default SingleCurrency

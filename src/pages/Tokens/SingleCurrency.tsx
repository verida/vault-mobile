import Clipboard from '@react-native-community/clipboard'
import { RouteProp } from '@react-navigation/native'
import { AssetId, ChainId } from 'caip'
import {
  getBlockchainNetworkLabel,
  getSelectedWalletById,
  getSupportedTokenObjectDecimals,
  getWalletsData,
  SelectSingleTokenData,
  selectTransactions,
  Transaction,
  useGetTransactionsForTokenQuery,
  useMaybeBalanceForChainId,
  useMaybeBlockchainNetwork,
} from 'features/cryptoWallet'
import { Icon } from 'native-base'
import React from 'react'
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
import { RootState } from 'reduxStore/types'

export type SingleCurrencyRouteProp = RouteProp<
  MainStackParams,
  'SingleCurrency'
>

export type SingleCurrencyScreenProps = {
  readonly item: SelectSingleTokenData
}

const SingleCurrency = () => {
  const navigation = useMainNavigation()
  const wallets = useSelector(getWalletsData)
  const selectedWallet = useSelector(getSelectedWalletById)

  // TODO: we should fetch here instead, not pass the route params
  const { item: tokenData } = useParams<SingleCurrencyScreenProps>()

  const maybeAsset: AssetId | undefined =
    Boolean(tokenData) && 'asset' in tokenData ? tokenData.asset : undefined

  const blockchainNetwork = useMaybeBlockchainNetwork(maybeAsset?.chainId)

  const maybeChainId: string | undefined = maybeAsset
    ? new ChainId(maybeAsset.chainId).toString()
    : undefined

  const maybeAddress = maybeChainId
    ? wallets?.[maybeChainId]?.address
    : undefined

  const {
    isLoading: isLoadingTransactions,
    isFetching: isFetchingTransactions,
    error: errorTransactions,
    refetch: refetchTransactions,
  } = useGetTransactionsForTokenQuery({
    userAddress: maybeAddress || null,
    asset: maybeAsset || null,
  })

  const {
    maybeBalance,
    isLoading: isLoadingBalance,
    isFetching: isFetchingBalance,
    error: errorBalance,
    refetch: refetchBalance,
  } = useMaybeBalanceForChainId(maybeAsset?.chainId)

  const isLoading = isLoadingTransactions || isLoadingBalance
  const isFetching = isFetchingTransactions || isFetchingBalance
  const error = errorTransactions || errorBalance

  const pullToRefresh = React.useCallback(() => {
    refetchTransactions()
    refetchBalance()
  }, [refetchTransactions, refetchBalance])

  const list = useSelector<RootState, readonly Transaction[]>((state) =>
    selectTransactions(state, maybeAsset)
  )

  if (error)
    return (
      <ErrorFallbackCard
        error={new Error('Failed to load transactions')}
        resetErrorBoundary={pullToRefresh}
      />
    )

  const maybeToken =
    Boolean(tokenData) && 'token' in tokenData ? tokenData.token : undefined

  const maybeSymbol = maybeToken?.symbol

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={tokenData.label}
      />
      <TestnetWarning
        networkReference={getBlockchainNetworkLabel(blockchainNetwork)}
      />
      <TokenBanner
        data={maybeBalance}
        selectedWallet={selectedWallet}
        receiveButtonAction={() =>
          navigation.navigate('ReceiveToken', { token: tokenData })
        }
        sendButtonAction={() =>
          navigation.navigate('SendToken', { token: tokenData })
        }
        copyButtonAction={() => {
          if (!maybeAddress) {
            return
          }

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
        <TransactionsList
          symbol={maybeSymbol}
          decimal={getSupportedTokenObjectDecimals(
            maybeToken,
            blockchainNetwork
          )}
          blockchainNetwork={blockchainNetwork}
          token={maybeToken}
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

import { getMaybeChainMetadatas, useChainMetadatas } from 'features/caip'
import * as React from 'react'
import { useSelector } from 'react-redux'

import {
  AggregateWalletBannerBalances,
  BalanceByChainResult,
  isBalanceByChainResult,
  UseAggregateWalletBannerBalancesParams,
  UseAggregateWalletBannerBalancesState,
} from '../@types'
import { useGetBalancesQuery } from '../api'
import { DEFAULT_AGGREGATE_WALLET_BANNER_BALANCES_RESULT } from '../constants'
import { useCryptoWalletContext } from '../contexts'
import { getUniqueWalletAddresses, getWallets } from '../slice'
import { chainMetadataToAggregateWalletBannerBalance } from '../utils/chainMetadataToAggregateWalletBannerBalance'
import { isAggregateWalletBannerBalanceMatchesResource } from '../utils/isAggregateWalletBannerBalanceMatchesResource'
import { getMaybeCreateCryptoWalletBalancesResult } from './useCreateCryptoWalletBalances'

export const getAggregateWalletBannerBalanceError = (
  state: UseAggregateWalletBannerBalancesState
): Error | undefined => {
  if (state.loading || !('error' in state)) return undefined

  return state.error
}

export const getAggregateWalletBannerBalanceResult = (
  state: UseAggregateWalletBannerBalancesState
): AggregateWalletBannerBalances => {
  if (state.loading || !('result' in state))
    return DEFAULT_AGGREGATE_WALLET_BANNER_BALANCES_RESULT

  return state.result
}

// Here we internalize the legacy mechanism for fetching wallet balances.
// This is dependent solely on the Wallet Provider as the arbiter of truth -
// however, the app is capable of integrating with custom networks which the
// Wallet Provider does not have an a priori awareness of. Instead, we lean
// on the Wallet Provider to return cached price information.
export function useAggregateWalletBannerBalances(
  params: UseAggregateWalletBannerBalancesParams = {}
): UseAggregateWalletBannerBalancesState & {
  readonly refetch: () => Promise<void>
} {
  const wallets = useSelector(getWallets)

  const cryptoWalletContext = useCryptoWalletContext()
  const cryptoWalletBalances =
    getMaybeCreateCryptoWalletBalancesResult(cryptoWalletContext)
  const { refetch: refetchCryptoWalletContext } = cryptoWalletContext

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const { resource: maybeResource } = params

  // Note: We need a way to distinguish between when the caller
  //       has intended to scope the returned balances to a particular
  //       resource but that information was not yet ready, versus
  //       wanting to determine balances across all resources.
  const didDefineResource = 'resource' in params

  const {
    data: dataWalletProvider,
    isLoading: isLoadingWalletProvider,
    error: errorWalletProvider,
    refetch: refetchWalletProvider,
  } = useGetBalancesQuery(
    React.useMemo(() => getUniqueWalletAddresses(wallets), [wallets])
  )

  const state = React.useMemo<UseAggregateWalletBannerBalancesState>(() => {
    if (errorWalletProvider)
      return {
        loading: false,
        error: new Error('Failed to load balances from WalletProvider', {
          cause: errorWalletProvider,
        }),
      }

    if (isLoadingWalletProvider || !dataWalletProvider) return { loading: true }

    // Fetch the value balanceByChainResults.
    // TODO: pair this information with the collected network balances
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const balanceByChainResults: readonly BalanceByChainResult[] =
      dataWalletProvider.list.flatMap((e) =>
        isBalanceByChainResult(e) ? [e] : []
      )

    const aggregateWalletBannerBalances = chainMetadatas.map((chainMetadata) =>
      chainMetadataToAggregateWalletBannerBalance({
        balanceByChainResults,
        chainMetadata,
        cryptoWalletBalances,
      })
    )

    const resultForOnlyMatchingChains: AggregateWalletBannerBalances =
      aggregateWalletBannerBalances.filter((aggregateWalletBannerBalance) => {
        // If we didn't define a resource to filter against, then assume all match.
        if (!didDefineResource) return true

        // If we did define a resource to use but that resource isn't ready, nothing
        // should match.
        if (!maybeResource) return false

        return isAggregateWalletBannerBalanceMatchesResource({
          aggregateWalletBannerBalance,
          resource: maybeResource,
        })
      })

    return {
      loading: false,
      result: resultForOnlyMatchingChains,
    }
  }, [
    dataWalletProvider,
    isLoadingWalletProvider,
    errorWalletProvider,
    maybeResource,
    didDefineResource,
    chainMetadatas,
    cryptoWalletBalances,
  ])

  const refetch = React.useCallback(
    async (): Promise<void> =>
      Promise.all([refetchWalletProvider(), refetchCryptoWalletContext()]).then(
        () => undefined
      ),
    [refetchWalletProvider, refetchCryptoWalletContext]
  )

  return React.useMemo(() => ({ ...state, refetch }), [state, refetch])
}

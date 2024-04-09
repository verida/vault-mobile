import BigDecimal from 'bignumber.js'
import { ChainId } from 'caip'
import * as React from 'react'

import {
  getMaybeChainMetadatas,
  useChainMetadatas,
} from '~/features/blockchain'

import { DEFAULT_AGGREGATE_WALLET_BANNER_BALANCES_RESULT } from '../constants'
import { useCryptoWalletBalanceContext } from '../contexts'
import {
  AggregateWalletBannerBalances,
  UseAggregateWalletBannerBalancesParams,
  UseAggregateWalletBannerBalancesState,
} from '../types'
import {
  balanceByChainResultsToErc20AggregateWalletBannerBalance,
  chainMetadataToAggregateWalletBannerBalance,
  isAggregateWalletBannerBalanceMatchesResource,
} from '../utils'
import { useBalanceByChainResultsForUniqueWalletAddresses } from './useBalanceByChainResultsForUniqueWalletAddresses'
import { getMaybeCreateCryptoWalletBalancesResult } from './useCreateCryptoWalletBalances'
import { useSelectedCryptoWallet } from './useSelectedCryptoWallet'

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
  const cryptoWalletContext = useCryptoWalletBalanceContext()
  const cryptoWalletBalances =
    getMaybeCreateCryptoWalletBalancesResult(cryptoWalletContext)
  const { refetch: refetchCryptoWalletContext } = cryptoWalletContext

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const selectedCryptoWallet = useSelectedCryptoWallet()

  const currentChainIds = React.useMemo(() => {
    return (selectedCryptoWallet?.accounts || []).map(
      (account) => new ChainId(account.chainId)
    )
  }, [selectedCryptoWallet])

  const { resource: maybeResource } = params

  // Note: We need a way to distinguish between when the caller
  //       has intended to scope the returned balances to a particular
  //       resource but that information was not yet ready, versus
  //       wanting to determine balances across all resources.
  const didDefineResource = 'resource' in params

  const {
    error: errorWalletProvider,
    loading: isLoadingWalletProvider,
    balanceByChainResults,
    refetch: refetchWalletProvider,
  } = useBalanceByChainResultsForUniqueWalletAddresses()

  const state = React.useMemo<UseAggregateWalletBannerBalancesState>(() => {
    if (errorWalletProvider)
      return {
        loading: false,
        error: new Error('Failed to load balances from WalletProvider', {
          cause: errorWalletProvider,
        }),
      }

    if (isLoadingWalletProvider) return { loading: true }

    const nativeBalances = chainMetadatas.map((chainMetadata) =>
      chainMetadataToAggregateWalletBannerBalance({
        balanceByChainResults,
        chainMetadata,
        cryptoWalletBalances,
      })
    )

    const erc20Balances =
      balanceByChainResultsToErc20AggregateWalletBannerBalance({
        balanceByChainResults,
        chainMetadatas,
      })

    const aggregateWalletBannerBalances: AggregateWalletBannerBalances = [
      ...erc20Balances,
      ...nativeBalances,
    ].sort((a, b) => {
      // If both the balances carry a valuation, compare them.
      if (a.valuation && b.valuation)
        return b.valuation.price.minus(a.valuation.price).toNumber()

      // Else, when comparing tokens without a valuation...
      if (a.valuation && a.valuation.price.gt(0)) return -1
      if (b.valuation && b.valuation.price.gt(0)) return 1

      // Else, compare by the size of the position.
      return BigDecimal(b.balance).minus(BigDecimal(a.balance)).toNumber()
    })

    const resultForOnlyMatchingChains: AggregateWalletBannerBalances =
      aggregateWalletBannerBalances.filter((aggregateWalletBannerBalance) => {
        // Check the chain id of the item against the chain ids of the currently selected wallet. Exclude items that don't match.
        const itemChainId = new ChainId(
          'chainId' in aggregateWalletBannerBalance.resource
            ? aggregateWalletBannerBalance.resource.chainId
            : aggregateWalletBannerBalance.resource
        )
        const isOnCurrentlySelectedChain = currentChainIds.find(
          (chainId) =>
            itemChainId.namespace === chainId.namespace &&
            itemChainId.reference === chainId.reference
        )
        if (!isOnCurrentlySelectedChain) return false

        // If we didn't define a resource to filter against, then assume all match.
        if (!didDefineResource) return true

        // If we did define a resource to use but that resource isn't ready, nothing
        // should match.
        if (!maybeResource) return false

        const matches = isAggregateWalletBannerBalanceMatchesResource({
          aggregateWalletBannerBalance,
          resource: maybeResource,
        })

        return matches
      })

    return {
      loading: false,
      result: resultForOnlyMatchingChains,
    }
  }, [
    currentChainIds,
    errorWalletProvider,
    isLoadingWalletProvider,
    chainMetadatas,
    balanceByChainResults,
    cryptoWalletBalances,
    didDefineResource,
    maybeResource,
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

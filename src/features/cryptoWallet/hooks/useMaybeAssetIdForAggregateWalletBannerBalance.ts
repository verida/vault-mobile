import { AssetId } from 'caip'
import * as React from 'react'

import { AggregateWalletBannerBalance } from '../@types'
import { useBalanceByChainResultsForUniqueWalletAddresses } from './useBalanceByChainResultsForUniqueWalletAddresses'

// HACK: We need to know AssetIds in order to query the WalletProvider for things
//       like TransactionHistory. However, it is not possible to determine all of
//       the AssetIds deterministically, for things like base layer currencies on
//       chains which the WalletProvider has no knowledge of.  Here, we attempt
//       to reconstruct the AssetId for an `AggregateWalletBannerBalance` on a best-
//       effort basis which does not require imbuing the AggregateWalletBannerBalance
//       with perfunctory information.
export function useMaybeAssetIdForAggregateWalletBannerBalance({
  aggregateWalletBannerBalance: maybeAggregateWalletBannerBalance,
}: {
  readonly aggregateWalletBannerBalance:
    | AggregateWalletBannerBalance
    | null
    | undefined
}): AssetId | undefined {
  const { balanceByChainResults } =
    useBalanceByChainResultsForUniqueWalletAddresses()

  return React.useMemo<AssetId | undefined>(() => {
    if (!maybeAggregateWalletBannerBalance) return undefined

    const { resource } = maybeAggregateWalletBannerBalance

    // Search for matching AssetIds for a base-layer currency.
    return balanceByChainResults
      .map((e) => e.asset)
      .find((e) => e.toString() === resource.toString())
  }, [maybeAggregateWalletBannerBalance, balanceByChainResults])
}

import { AssetId, ChainId } from 'caip'
import * as React from 'react'

import {
  AggregateWalletBannerBalance,
  isAssetIdResourceParams,
  isChainIdResourceParams,
  ResourceParams,
} from '../@types'
import { useBalanceByChainResultsForUniqueWalletAddresses } from './useBalanceByChainResultsForUniqueWalletAddresses'

// TODO: Move this somewhere.
const maybeNormalizeResourceParams = (e: ResourceParams) => {
  if (isAssetIdResourceParams(e)) {
    const asset = new AssetId(e)

    if (asset.assetName.namespace === 'slip44') return new ChainId(e.chainId)

    return asset
  } else if (isChainIdResourceParams(e)) {
    return new ChainId(e)
  }

  return undefined
}

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

    const ref = maybeNormalizeResourceParams(resource)

    if (!ref) return undefined

    // Search for matching AssetIds for a base-layer currency.
    return balanceByChainResults
      .map((e) => e.asset)
      .find((e) => {
        const n = maybeNormalizeResourceParams(e)

        if (!n) return false

        return n.toString() === ref.toString()
      })
  }, [maybeAggregateWalletBannerBalance, balanceByChainResults])
}

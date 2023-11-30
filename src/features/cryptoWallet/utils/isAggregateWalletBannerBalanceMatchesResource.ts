import { AssetId, ChainId } from 'caip'

import {
  AggregateWalletBannerBalance,
  isAssetIdResourceParams,
  isChainIdResourceParams,
  ResourceParams,
} from '../@types'

export function isAggregateWalletBannerBalanceMatchesResource({
  aggregateWalletBannerBalance: { resource: maybeMatchingResource },
  resource,
}: {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly resource: ResourceParams
}): boolean {
  if (
    isChainIdResourceParams(maybeMatchingResource) &&
    isChainIdResourceParams(resource)
  )
    return (
      new ChainId(maybeMatchingResource).toString() ===
      new ChainId(resource).toString()
    )

  if (
    isAssetIdResourceParams(maybeMatchingResource) &&
    isAssetIdResourceParams(resource)
  )
    return (
      new AssetId(maybeMatchingResource).toString() ===
      new AssetId(resource).toString()
    )

  return false
}

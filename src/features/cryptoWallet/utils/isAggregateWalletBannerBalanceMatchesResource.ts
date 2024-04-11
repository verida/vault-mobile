import { AssetType, ChainId } from 'caip'

import {
  AggregateWalletBannerBalance,
  isAssetTypeResourceParams,
  isChainIdResourceParams,
  ResourceParams,
} from '../types'

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
    isAssetTypeResourceParams(maybeMatchingResource) &&
    isAssetTypeResourceParams(resource)
  )
    return (
      new AssetType(maybeMatchingResource).toString() ===
      new AssetType(resource).toString()
    )

  return false
}

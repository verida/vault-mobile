import { AssetId, AssetIdParams, ChainIdParams } from 'caip'

import {
  AggregateWalletBannerBalance,
  isAssetIdResourceParams,
  isChainIdResourceParams,
  ResourceParams,
} from '../@types'
import { getChainIdParamsFromResourceParams } from './getChainIdParamsFromResourceParams'
import { isNativeToken } from './isNativeToken'

function isAggregateWalletBannerBalanceMatchesChainIdResource({
  aggregateWalletBannerBalance,
  resource,
}: {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly resource: ChainIdParams
}): boolean {
  const { resource: res } = aggregateWalletBannerBalance

  const chainId = getChainIdParamsFromResourceParams(res)

  return (
    resource.namespace === chainId.namespace &&
    resource.reference === chainId.reference
  )
}

function isAggregateWalletBannerBalanceMatchesAssetIdResource({
  aggregateWalletBannerBalance,
  resource,
}: {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly resource: AssetIdParams
}): boolean {
  const { resource: res } = aggregateWalletBannerBalance

  // Assets are more specific than chains. If we're trying to compare
  // a simple chain definition, we know it is not as specific as an
  // asset definition, so we know this comparison will fail to match.
  if (!isAssetIdResourceParams(res)) return false

  return (
    res.assetName === resource.assetName &&
    res.chainId === resource.chainId &&
    res.tokenId === resource.tokenId
  )
}

// TODO: add tests
export function isAggregateWalletBannerBalanceMatchesResource({
  aggregateWalletBannerBalance,
  resource,
}: {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly resource: ResourceParams
}): boolean {
  if (
    isChainIdResourceParams(resource) ||
    (isAssetIdResourceParams(resource) && isNativeToken(new AssetId(resource)))
  )
    return isAggregateWalletBannerBalanceMatchesChainIdResource({
      resource: getChainIdParamsFromResourceParams(resource),
      aggregateWalletBannerBalance,
    })

  if (isAssetIdResourceParams(resource)) {
    return isAggregateWalletBannerBalanceMatchesAssetIdResource({
      resource,
      aggregateWalletBannerBalance,
    })
  }

  return false
}

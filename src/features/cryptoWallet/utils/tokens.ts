import { AssetId, AssetIdParams, ChainId } from 'caip'
import { BigNumberish, utils } from 'ethers'
import { isSupportedCaipNamespace } from 'features/caip'

import { BlockchainNetwork } from 'api/types'

import { MinifiedVeridaAccounts, SupportedTokenObject } from '../@types'
import { isNativeToken } from './isNativeToken'

export const getTruncatedWalletAddress = (
  address: string,
  leftIndex = 6,
  rightIndex = -4
) => {
  return `${address.slice(0, leftIndex)}...${address.slice(rightIndex)}`
}

export const getTokenAddress = (address: AssetId) => {
  if (isNativeToken(address)) return 'slip44'

  return address.assetName.reference
}

export const getWalletAddressForChainId = (
  chainId: ChainId | null | undefined,
  minifiedVeridaAccounts: MinifiedVeridaAccounts
  //wallets: WalletsData
) => {
  if (!chainId) return undefined

  const { namespace } = chainId

  if (!isSupportedCaipNamespace(namespace)) return undefined

  // TODO: What happens if there are dupliate keys?
  const maybeMatchingAccount = minifiedVeridaAccounts.find(
    (e) => e.namespace === namespace
  )

  if (!maybeMatchingAccount) return undefined

  const { address } = maybeMatchingAccount

  return address
}

export const getWalletAddressForAsset = (
  asset: AssetId | null | undefined,
  minifiedVeridaAccounts: MinifiedVeridaAccounts
) => {
  if (!asset) return undefined

  return getWalletAddressForChainId(asset.chainId, minifiedVeridaAccounts)
}

export const handleTokenDecimals = (
  quantity: number,
  decimalPlaces: number
): number | undefined => {
  if (!quantity) return undefined

  return quantity / Math.pow(10, decimalPlaces)
}

export const formatTokenQuantity = (
  quantity: number,
  decimalPlaces: number,
  fixed = 3
) => {
  const finalQuantity = handleTokenDecimals(quantity, decimalPlaces)

  if (!finalQuantity) return '-'

  return finalQuantity.toFixed(fixed)
}

export const parseUnitsForSending = (
  quantity: string,
  decimalPlaces: BigNumberish | undefined
) => {
  return utils.parseUnits(quantity, decimalPlaces)
}

export const tokenCaipObjectToString = (asset: AssetIdParams | string) => {
  const assetId = new AssetId(asset)

  return assetId.toString()
}

export const getSupportedTokenObjectDecimals = (
  supportedTokenObject: SupportedTokenObject | undefined,
  blockchainNetwork: BlockchainNetwork | undefined
): number => {
  if (supportedTokenObject && 'decimal' in supportedTokenObject)
    return supportedTokenObject.decimal

  if (blockchainNetwork) return blockchainNetwork.decimal

  // TODO: Refactor logic around decimals. I'm using the EVM default of 18 here
  //       as the common case, but this may be invalid.
  return 18
}

import { AssetId, ChainId } from 'caip'
import { utils } from 'ethers'

export const isNativeToken = (asset) => {
  return asset.assetName.namespace === 'slip44'
}

export const getTruncatedWalletAddress = (
  address,
  leftIndex = 6,
  rightIndex = -4
) => {
  return `${address.slice(0, leftIndex)}...${address.slice(rightIndex)}`
}

export const getTokenAddress = (address) => {
  if (isNativeToken(address)) {
    return 'slip44'
  }

  return address.assetName.reference
}

export const getWalletAddressForAsset = (asset, wallets) => {
  const chainId = new ChainId(asset.chainId).toString()
  return wallets[chainId].address
}

export const handleTokenDecimals = (quantity, decimalPlaces) => {
  if (!quantity) {
    return
  }
  return quantity / Math.pow(10, decimalPlaces)
}

export const formatTokenQuantity = (quantity, decimalPlaces, fixed = 3) => {
  const finalQuantity = handleTokenDecimals(quantity, decimalPlaces)
  if (!finalQuantity) {
    return '-'
  }
  return finalQuantity.toFixed(fixed)
}

export const parseUnitsForSending = (quantity, decimalPlaces) => {
  return utils.parseUnits(quantity, decimalPlaces)
}

export const tokenCaipObjectToString = (asset) => {
  const assetId = new AssetId(asset)

  return assetId.toString()
}

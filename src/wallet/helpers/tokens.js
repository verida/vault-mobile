import { AssetId } from 'caip'

export const getTokenAddress = (address) => {
  const parsed = AssetId.parse(address)
  return parsed.assetName.reference
}

export const isNativeToken = (address) => {
  return getTokenAddress(address) === 'slip44'
}

export const getTokenChain = (address) => {
  const parsed = AssetId.parse(address)
  return parsed.chainId.namespace
}

export const handleTokenDecimals = (quantity, decimalPlaces) => {
  return quantity / Math.pow(10, decimalPlaces)
}

export const formatTokenQuantity = (quantity, decimalPlaces) => {
  return handleTokenDecimals(quantity, decimalPlaces).toFixed(3)
}

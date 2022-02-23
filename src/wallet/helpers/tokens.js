import { AssetId } from 'caip'

const toFixed = (n, fixed) => ~~(Math.pow(10, fixed) * n) / Math.pow(10, fixed)

export const getTokenAddress = (address) => {
  const parsed = AssetId.parse(address)
  return parsed.assetName.reference
}

export const isNativeToken = (address) => {
  return (
    getTokenAddress(address) === 'slip44' ||
    getTokenAddress(address) === '0x0000001'
  )
}

export const getTokenChain = (address) => {
  const parsed = AssetId.parse(address)
  return parsed.chainId.namespace
}

export const handleTokenDecimals = (quantity, decimalPlaces) => {
  return quantity / Math.pow(10, decimalPlaces)
}

export const formatTokenQuantity = (quantity, decimalPlaces) => {
  // return toFixed(handleTokenDecimals(quantity, decimalPlaces), 3)
  return handleTokenDecimals(quantity, decimalPlaces).toFixed(3)
}

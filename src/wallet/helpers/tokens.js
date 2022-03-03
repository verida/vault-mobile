import { AssetId } from 'caip'
import { utils } from 'ethers'

export const getTokenAddress = (address) => {
  const parsed = AssetId.parse(address)
  return parsed.assetName.reference
}

export const isNativeToken = (address) => {
  // having to put a hack for Ethereum due to CAIP library having issues, waiting for update.
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

export const formatTokenQuantity = (quantity, decimalPlaces, fixed = 3) => {
  return handleTokenDecimals(quantity, decimalPlaces).toFixed(fixed)
}

export const parseUnitsForSending = (quantity, decimalPlaces) => {
  return utils.parseUnits(quantity, decimalPlaces)
}

export const getExplorerUrl = (chain) => {
  return chain === 'algorand'
    ? 'https://testnet.algoexplorer.io/tx/'
    : 'https://rinkeby.etherscan.io/tx/'
}

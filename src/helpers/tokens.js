import { AssetId } from 'caip'

export const getTokenAddress = (address) => {
  const parsed = AssetId.parse(address)
  return parsed.assetName.reference
}

export const isNativeToken = (address) => {
  return getTokenAddress(address) === 'slip44'
}

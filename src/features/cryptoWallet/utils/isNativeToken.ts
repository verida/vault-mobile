import { AssetType } from 'caip'

export const isNativeToken = (asset: AssetType) =>
  asset.assetName.namespace === 'slip44'

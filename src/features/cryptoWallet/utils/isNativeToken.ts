import { AssetId } from 'caip'

export const isNativeToken = (asset: AssetId) =>
  asset.assetName.namespace === 'slip44'

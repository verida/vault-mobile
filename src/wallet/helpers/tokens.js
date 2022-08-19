import multiChainWallet from 'wallet/helpers/multiChainWallet'
import { AssetId } from 'caip'
import { utils } from 'ethers'

export const isNativeToken = (address) => {
  return address.assetName.namespace === 'slip44'
}

export const getTokenAddress = (address) => {
  if (isNativeToken(address)) {
    return 'slip44'
  }

  return address.assetName.reference
}

export const getTokenChain = (address) => {
  return address.chainId.namespace
}

export const getTokenChainId = (address) => {
  return address.chainId
}

export const getTokenChainReference = (address) => {
  return address.chainId.reference
}

export const getNativeForChain = (tokens, chain) => {
  let tok = tokens.find(
    (ele) => ele.slug === chain && ele.asset.assetName.namespace === 'slip44'
  )

  return tok
}

export const getWalletAddressForToken = (chain, wallets) => {
  return wallets[chain].address
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

export const rawDataToReduxState = (walletData, chains) => {
  let wallets = {}
  walletData.forEach((walt) => {
    let mnemonic = walt.mnemonic
    let waltId = walt._id
    let accounts = multiChainWallet.generateWalletsForChains(mnemonic, chains)

    wallets[waltId] = {
      seedPhrase: mnemonic,
      type: walt.walletType,
      label: walt.label,
      id: waltId,
      accounts,
    }
  })
  return wallets
}

export const getWalletAddressForAsset = (chainSlug, wallets) => {
  return wallets[chainSlug].address
}

export const tokenCaipObjectToString = (asset) => {
  const assetId = new AssetId(asset)

  return assetId.toString()
}

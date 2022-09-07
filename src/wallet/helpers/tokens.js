import { AssetId } from 'caip'
import { utils } from 'ethers'
import multiChainWallet from 'wallet/helpers/multiChainWallet'

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
    (ele) =>
      ele.identifier === chain && ele.asset.assetName.namespace === 'slip44'
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
    let waltId = walt._id
    let accounts = multiChainWallet.generateWalletsForChains({
      privateKey: walt.privateKey ? walt.privateKey : null,
      mnemonic: walt.mnemonic ? walt.mnemonic : null,
      chains,
      chain: walt.chain ? walt.chain : null,
    })

    wallets[waltId] = {
      seedPhrase: walt.mnemonic ? walt.mnemonic : null,
      privateKey: walt.privateKey ? walt.privateKey : null,
      type: walt.walletType,
      label: walt.label,
      id: waltId,
      accounts,
      chain: walt.chain ? walt.chain : null,
    }
  })

  return wallets
}

export const getWalletAddressForAsset = (addressMap, wallets) => {
  return wallets[addressMap].address
}

export const tokenCaipObjectToString = (asset) => {
  const assetId = new AssetId(asset)

  return assetId.toString()
}

import { AssetId } from 'caip'
import { utils } from 'ethers'
import multiChainWallet from 'wallet/helpers/multiChainWallet'

export const isNativeToken = (address) => {
  return address.assetName.namespace === 'slip44'
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
      ele.chainName === chain && ele.asset.assetName.namespace === 'slip44'
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
  walletData.forEach((wallet) => {
    let walletId = wallet._id
    let accounts = multiChainWallet.generateWalletsForChains({
      privateKey: wallet.privateKey ?? null,
      mnemonic: wallet.mnemonic ?? null,
      address: wallet.address ?? null,
      chains,
      chain: wallet.walletType === 'multi' ? null : wallet.walletType,
    })

    wallets[walletId] = {
      seedPhrase: wallet.mnemonic ?? null,
      privateKey: wallet.privateKey ?? null,
      type: wallet.walletType === 'multi' ? 'multi' : 'single',
      label: wallet.label,
      id: walletId,
      accounts,
      chain: wallet.walletType === 'multi' ? null : wallet.walletType,
    }
  })

  return wallets
}

export const getWalletAddressForAsset = (addressMapping, wallets) => {
  return wallets[addressMapping].address
}

export const tokenCaipObjectToString = (asset) => {
  const assetId = new AssetId(asset)

  return assetId.toString()
}

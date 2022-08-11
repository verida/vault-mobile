import WalletUtils from '@verida/wallet-utils'
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
    (ele) =>
      ele.asset.chainId.namespace + ':' + ele.asset.chainId.reference ===
        chain && ele.asset.assetName.namespace === 'slip44'
  )

  return tok
}

export const getChainMapping = (chain) => {
  const chainMapping = {
    'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=': 'algo',
    'eip155:4': 'ethr',
    'near:testnet': 'near',
    'eip155:80001': 'poly',
  }

  return chainMapping[chain]
}

export const getWalletAddressForToken = (chain, wallets) => {
  return wallets[getChainMapping(chain)].address
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

export const getExplorerUrl = (chainId) => {
  let url
  switch (chainId.namespace) {
    case 'algorand':
      url = 'https://testnet.algoexplorer.io/tx/'
      break
    case 'eip155':
      url =
        chainId.reference === '4'
          ? 'https://rinkeby.etherscan.io/tx/'
          : 'https://mumbai.polygonscan.com/tx/'
      break
    case 'near':
      url = 'https://explorer.testnet.near.org/transactions/'
      break
  }
  return url
}

export const rawDataToReduxState = (walletData) => {
  let wallets = {}
  walletData.forEach((walt) => {
    let mnemonic = walt.mnemonic
    let waltId = walt._id
    let accounts = WalletUtils.MultiChainWallet.generateHDWallets(mnemonic)

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

export const getWalletAddressForAsset = (asset, wallets) => {
  const chain = getTokenChain(asset)
  const chainRef = getTokenChainReference(asset)
  return wallets[getChainMapping(chain + ':' + chainRef)].address
}

export const tokenCaipObjectToString = (asset) => {
  const assetId = new AssetId(asset)

  return assetId.toString()
}

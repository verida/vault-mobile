import { AssetId } from 'caip'
import { utils } from 'ethers'
import { SUPPORTED_TOKENS } from 'wallet/constants'

export const getTokenAddress = (address) => {
  if (address.includes('slip44')) {
    return 'slip44'
  }

  if (address.includes('nep141:')) {
    const splt = address.split('/')
    return splt[1].replace('nep141:', '')
  }

  const parsed = AssetId.parse(address)
  return parsed.assetName.reference
}

export const isNativeToken = (address) => {
  // having to put a hack for Ethereum due to CAIP library having issues, waiting for update.
  return address.includes('slip44')
}

export const getTokenChain = (address) => {
  if (address.includes('near:')) {
    return 'near'
  } else if (address.includes('eip155:')) {
    return 'eip155'
  } else {
    const parsed = AssetId.parse(address)
    return parsed.chainId.namespace
  }
}

export const getNativeForChain = (chain) => {
  let tok = SUPPORTED_TOKENS.find(
    (ele) => ele.address.includes(chain) && ele.address.includes('slip44')
  )

  return tok
}

export const getWalletAddressForToken = (tokenAddress, wallets) => {
  const chainMapping = {
    algorand: 'algo',
    eip155: 'ethr',
    near: 'near',
  }

  const chain = getTokenChain(tokenAddress)
  return wallets[chainMapping[chain]].address
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
  let url
  switch (chain) {
    case 'algorand':
      url = 'https://testnet.algoexplorer.io/tx/'
      break
    case 'ethereum':
      url = 'https://rinkeby.etherscan.io/tx/'
      break
    case 'near':
      url = 'https://explorer.testnet.near.org/transactions/'
      break
  }
  return url
}

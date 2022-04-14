import algosdk from 'algosdk'
import { web3 } from 'wallet/chains/ethereum'
import { getTokenChain } from 'wallet/helpers/tokens'

const validateNearAddress = (address) => {
  if (address.includes('.') && address.length >= 2 && address.length <= 64) {
    return true
  } else {
    return address.length === 64
  }
}

export const isValidWalletAddress = (address, tokenAddress) => {
  let chain = getTokenChain(tokenAddress)
  switch (chain) {
    case 'algorand':
      return algosdk.isValidAddress(address)
    case 'eip155':
      return web3.utils.isAddress(address)
    case 'near':
      return validateNearAddress(address)
  }
}

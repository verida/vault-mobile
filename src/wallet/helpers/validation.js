import algosdk from 'algosdk'
import Web3 from 'web3'
import { getTokenChain } from 'wallet/helpers/tokens'

const bip39 = require('bip39')

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
      return Web3.utils.isAddress(address)
    case 'near':
      return validateNearAddress(address)
  }
}

export const isValidSeedPhrase = (phrase) => {
  return bip39.validateMnemonic(phrase)
}

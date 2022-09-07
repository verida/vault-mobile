import algosdk from 'algosdk'
import { getTokenChain } from 'wallet/helpers/tokens'
import Web3 from 'web3'
import * as ethers from 'ethers'

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

export const isValidSeedPhrase = (data) => {
  const { phrase, privateKey, blockchain, inputSwitch } = data

  console.log(data)
  if (blockchain === 'multi' || blockchain === 'near') {
    // valid bip39 12 word seedphrase
    return bip39.validateMnemonic(phrase)
  } else if (blockchain === 'algorand') {
    // is valid algorand 25 word seedphrase
    try {
      const algoWallet = algosdk.mnemonicToSecretKey(phrase)
      if (algoWallet && algoWallet.addr) {
        return true
      } else {
        return false
      }
    } catch (err) {
      return false
    }
  } else if (blockchain === 'ethereum' || blockchain === 'polygon') {
    if (inputSwitch === 'privateKey') {
      // is valid evm compatible privateKey
      try {
        const wallet = new ethers.Wallet(privateKey)
        if (wallet && wallet.address) {
          return true
        } else {
          return false
        }
      } catch (err) {
        return false
      }
    } else {
      // valid bip39 12 word seedphrase
      return bip39.validateMnemonic(phrase)
    }
  } else {
    return bip39.validateMnemonic(phrase)
  }
}

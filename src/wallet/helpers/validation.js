import algosdk from 'algosdk'
import * as ethers from 'ethers'
import Web3 from 'web3'

const bip39 = require('bip39')

const validateNearAddress = (address) => {
  if (address.includes('.') && address.length >= 2 && address.length <= 64) {
    return true
  } else {
    return address.length === 64
  }
}

export const isValidWalletAddress = (address, asset) => {
  switch (asset.chainId.namespace) {
    case 'algorand':
      return algosdk.isValidAddress(address)
    case 'eip155':
      return Web3.utils.isAddress(address)
    case 'near':
      return validateNearAddress(address)
  }
}

export const isValidSeedPhrase = (data) => {
  const { phrase, privateKey, blockchainNetwork, inputSwitch } = data

  if (
    blockchainNetwork === undefined ||
    blockchainNetwork.namespace === 'near'
  ) {
    // valid bip39 12 word seedphrase
    return bip39.validateMnemonic(phrase)
  } else if (blockchainNetwork.namespace === 'algorand') {
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
  } else if (blockchainNetwork.namespace === 'eip155') {
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

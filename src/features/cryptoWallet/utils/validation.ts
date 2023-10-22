import { AssetId } from 'caip'
import * as ethers from 'ethers'
import { SupportedCaipNamespace } from 'features/caip'

import { ImportedSeedPhrase } from '../@types'

const bip39 = require('bip39')

const validateNearAddress = (address: string) => {
  if (address.includes('.') && address.length >= 2 && address.length <= 64) {
    return true
  } else {
    return address.length === 64
  }
}

export const isValidWalletAddress = (
  address: string,
  asset: AssetId | undefined
) => {
  if (!asset) return false

  const { namespace } = asset.chainId

  switch (namespace) {
    case SupportedCaipNamespace.EIP_155:
      return ethers.utils.isAddress(address)
    case SupportedCaipNamespace.NEAR:
      return validateNearAddress(address)
    default:
      // eslint-disable-next-line no-console
      console.warn(
        `[isValidWalletAddress]: Encountered unexpected namespace, "${namespace}".`
      )
  }

  return false
}

export const isValidSeedPhrase = ({
  phrase,
  privateKey,
  blockchainNetwork,
  inputSwitch,
}: ImportedSeedPhrase) => {
  if (!blockchainNetwork || blockchainNetwork.namespace === 'near') {
    // valid bip39 12 word seedphrase
    return bip39.validateMnemonic(phrase)
  } else if (blockchainNetwork.namespace === 'eip155') {
    if (inputSwitch === 'privateKey') {
      // is valid evm compatible privateKey
      try {
        return Boolean(new ethers.Wallet(privateKey)?.address)
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

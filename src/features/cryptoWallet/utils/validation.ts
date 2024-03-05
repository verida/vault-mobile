import { AssetId, ChainId } from 'caip'
import * as ethers from 'ethers'
import { SupportedBlockchainNamespace } from 'features/blockchain/@types/enums'
import { Logger } from 'features/telemetry'

import { ImportedSeedPhrase } from '../@types'

const bip39 = require('bip39')

const logger = Logger.create('validation')

const validateNearAddress = (address: string) => {
  if (address.includes('.') && address.length >= 2 && address.length <= 64) {
    return true
  } else {
    return address.length === 64
  }
}

export const isValidWalletAddressForChainId = (
  address: string,
  chainId: ChainId | undefined
) => {
  if (!chainId) return false

  const { namespace } = chainId

  switch (namespace) {
    case SupportedBlockchainNamespace.EIP_155:
      return ethers.utils.isAddress(address)
    case SupportedBlockchainNamespace.NEAR:
      return validateNearAddress(address)
    default:
      logger.warn(
        `[isValidWalletAddress]: Encountered unexpected namespace, "${namespace}".`
      )
  }

  return false
}

export const isValidWalletAddressForAssetId = (
  address: string,
  asset: AssetId | undefined
) => {
  if (!asset) return false

  return isValidWalletAddressForChainId(address, asset.chainId)
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

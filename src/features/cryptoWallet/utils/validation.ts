import * as bip39 from 'bip39'
import { AssetId, ChainId } from 'caip'
import * as ethers from 'ethers'

import { Logger } from '~/features/telemetry'

import { WalletType } from '../types'

const logger = Logger.create('CryptoWallets')

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
    case 'eip155':
      return ethers.utils.isAddress(address)
    case 'near':
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

export function isValidMnemonic(_walletType: WalletType, mnemonic: string) {
  // TODO: Define somewhere the list of wallet types that support mnemonics

  return bip39.validateMnemonic(mnemonic)
}

export function isValidPrivateKey(walletType: WalletType, privateKey: string) {
  if (walletType !== 'eip155') {
    // TODO: Define somewhere the list of wallet types that support private keys
    return false // TODO: Throw an error instead
  }

  try {
    return Boolean(new ethers.Wallet(privateKey)?.address)
  } catch (_error) {
    return false
  }
}

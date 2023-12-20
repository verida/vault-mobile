import { explodeDID } from '@verida/helpers'
import { ethers, utils } from 'ethers'

export function generateIdentityMnemonic() {
  const node = utils.entropyToMnemonic(utils.randomBytes(16))
  const wallet = ethers.Wallet.fromMnemonic(node)

  return {
    mnemonic: node,
    privateKey: wallet.privateKey,
  }
}

export function getPrivateKeyFromMnemonic(mnemonic: string) {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic)
  return wallet.privateKey
}

export function getAddressFromDID(did: string): string {
  const { address } = explodeDID(did)
  return address
}

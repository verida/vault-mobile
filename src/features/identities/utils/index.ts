import { Account } from '@verida/account'
import { explodeDID } from '@verida/helpers'
import { EnvironmentType } from '@verida/types'
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

export function getNetworkFromDID(did: string): EnvironmentType {
  const { network: networkAsString } = explodeDID(did)
  const network =
    networkAsString === EnvironmentType.MAINNET
      ? EnvironmentType.MAINNET
      : networkAsString === EnvironmentType.TESTNET
      ? EnvironmentType.TESTNET
      : networkAsString === EnvironmentType.DEVNET
      ? EnvironmentType.DEVNET
      : networkAsString === EnvironmentType.LOCAL
      ? EnvironmentType.LOCAL
      : null

  if (!network) throw new Error(`Invalid Verida Network: ${networkAsString}`)

  return network
}

export async function getNetworkFromAccount(account: Account) {
  const did = await account.did()
  return getNetworkFromDID(did)
}

export function getAddressFromDID(did: string): string {
  const { address } = explodeDID(did)
  return address
}

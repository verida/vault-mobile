import { NearWalletController } from 'wallet-connect/controllers/near'

export let nearAddresses: string[]
export let nearWallet: NearWalletController

/**
 * Utilities
 */
export async function createOrRestoreNearWallet() {
  // NEAR only supports dev accounts in testnet.
  const wallet = await NearWalletController.init('testnet')
  const accounts = await wallet.getAllAccounts()

  nearAddresses = accounts.map((x) => x.accountId)
  nearWallet = wallet

  return {
    nearWallet,
    nearAddresses,
  }
}

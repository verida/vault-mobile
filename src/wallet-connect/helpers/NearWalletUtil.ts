import { store } from 'reduxStore'
import { NearWalletController } from 'wallet-connect/controllers/near'

import { getWalletsData } from 'reduxStore/wallet/selectors'

export let nearAddresses: string[]
export let nearWallet: NearWalletController

/**
 * Utilities
 */
export async function createOrRestoreNearWallet() {
  const wallets = getWalletsData(store.getState())
  if (!wallets.near) {
    // eslint-disable-next-line no-console
    console.info('No Near address available')
    return null
  }

  // NEAR only supports dev accounts in testnet.
  const wallet = await NearWalletController.init('testnet')
  const accounts = await wallet.getAllAccounts()

  nearAddresses = accounts.map((x) => x!.accountId)
  nearWallet = wallet

  return {
    nearWallet,
    nearAddresses,
  }
}

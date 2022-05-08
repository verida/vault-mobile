import { WalletController } from './wallet'

let walletController: WalletController

export function getWalletController() {
  if (!walletController) {
    walletController = new WalletController()
  }

  return walletController
}

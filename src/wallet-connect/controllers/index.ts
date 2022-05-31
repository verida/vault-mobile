import { DApp } from '../types'
import { AlgorandWalletController } from './algorand'
import { EthereumWalletController } from './ethereum'

const walletControllers: Record<string, any> = {}

export function getWalletController(dapp?: DApp) {
  if (dapp && dapp.chain && !walletControllers[dapp.chain]) {
    if (dapp.chain === 'ethr') {
      const walletController = new EthereumWalletController()
      walletControllers[dapp.chain] = walletController
    } else if (dapp.chain === 'algo') {
      const walletController = new AlgorandWalletController()
      walletControllers[dapp.chain] = walletController
    } else {
      throw new Error(`Unsupported network: ${dapp.chain} / ${dapp.chainId}`)
    }
  }

  return walletControllers[dapp?.chain ?? '']
}

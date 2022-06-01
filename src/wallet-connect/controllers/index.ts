import { RINKEBY_CHAIN_ID } from '../constants'
import { DApp } from '../types'
import { AlgorandWalletController } from './algorand'
import { EthereumWalletController } from './ethereum'
import { IWalletController } from './type'

const walletControllers: Record<string, any> = {}

export function getWalletController(dapp?: DApp): IWalletController {
  if (dapp?.chain && !walletControllers[dapp.chain]) {
    if (dapp.chain === 'ethr' && dapp.chainId === RINKEBY_CHAIN_ID) {
      const walletController = new EthereumWalletController()
      walletControllers[dapp.chain] = walletController
    } else if (dapp.chain === 'algo' || dapp.chainId === 0) {
      const walletController = new AlgorandWalletController()
      walletControllers[dapp.chain] = walletController
    } else {
      throw new Error(`Unsupported network: ${dapp.chain} / ${dapp.chainId}`)
    }
  }

  return walletControllers[dapp?.chain ?? '']
}

import { RINKEBY_CHAIN_ID } from '../constants'
import { DApp } from '../types'
import { AlgorandWalletController } from './algorand'
import { EthereumWalletController } from './ethereum'
import { IWalletController } from './type'

const walletControllers: Record<string, IWalletController> = {}

const getKey = (dapp: DApp) => `${dapp.walletId}/${dapp.chain}`

export function getWalletController(dapp?: DApp): IWalletController | null {
  if (!dapp) return null

  const ckey = getKey(dapp)
  if (dapp?.chain && !walletControllers[ckey]) {
    if (dapp.chain === 'eip155' && dapp.chainId === RINKEBY_CHAIN_ID) {
      walletControllers[ckey] = new EthereumWalletController()
    } else if (dapp.chain === 'algorand' || dapp.chainId === 0) {
      walletControllers[ckey] = new AlgorandWalletController()
    } else {
      throw new Error(`Unsupported network: ${dapp.chain} / ${dapp.chainId}`)
    }
  }

  return walletControllers[ckey ?? '']
}

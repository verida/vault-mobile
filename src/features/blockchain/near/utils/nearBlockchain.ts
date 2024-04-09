import WalletUtils from '@verida/wallet-utils'
import * as ethers from 'ethers'

import { IBlockchain, WalletUtilsWallet } from '../../types'

class NearBlockchain implements IBlockchain {
  public buildAccountFromMnemonic(
    mnemonic: string,
    derivationPath: string,
    multiChain: boolean
  ): WalletUtilsWallet {
    if (multiChain) {
      const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
      const childNode = node.derivePath(derivationPath)
      return WalletUtils.utils.getWallet('near', childNode.mnemonic!.phrase)
    }

    return WalletUtils.utils.getWallet('near', mnemonic)
  }

  public buildAccountFromPrivateKey(_privateKey: string): WalletUtilsWallet {
    throw new Error('Importing NEAR accounts from private key is not supported')
  }
}

export const nearBlockchain = new NearBlockchain()

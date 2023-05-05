import WalletUtils from '@verida/wallet-utils'
import * as ethers from 'ethers'

import { IBlockchain, WalletUtilsWallet } from './IBlockchain'

class nearBlockchain implements IBlockchain {
  public buildAccountFromMnemonic(
    mnemonic: string,
    derivationPath: string,
    multiChain: boolean
  ): WalletUtilsWallet {
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
    const childNode = node.derivePath(derivationPath)
    return WalletUtils.utils.getWallet('near', childNode.mnemonic!.phrase)
  }

  public buildAccountFromPrivateKey(privateKey: string): WalletUtilsWallet {
    throw new Error('Creating NEAR account from private key is not supported')
  }
}

export const Blockchain = new nearBlockchain()

import WalletUtils from '@verida/wallet-utils'
import * as ethers from 'ethers'

import { IBlockchain, WalletUtilsWallet } from '../../@types'

class EIP155Blockchain implements IBlockchain {
  public buildAccountFromMnemonic(
    mnemonic: string,
    derivationPath: string,
    _multiChain: boolean
  ): WalletUtilsWallet {
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
    const childNode = node.derivePath(derivationPath)
    return WalletUtils.utils.getWallet('ethr', childNode.mnemonic!.phrase)
  }

  public buildAccountFromPrivateKey(privateKey: string): WalletUtilsWallet {
    return WalletUtils.utils.getWalletByPrivateKey('ethr', privateKey)
  }
}

export const eip155Blockchain = new EIP155Blockchain()

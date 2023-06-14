import WalletUtils from '@verida/wallet-utils'
import * as ethers from 'ethers'

import { IBlockchain, WalletUtilsWallet } from './IBlockchain'

class eip1558Blockchain implements IBlockchain {
  public buildAccountFromMnemonic(
    mnemonic: string,
    derivationPath: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    multiChain: boolean
  ): WalletUtilsWallet {
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
    const childNode = node.derivePath(derivationPath)
    return WalletUtils.utils.getWallet('ethr', childNode.mnemonic!.phrase)
  }

  public buildAccountFromPrivateKey(privateKey: string): WalletUtilsWallet {
    return WalletUtils.utils.getWalletByPrivateKey('ethr', privateKey)
  }
}

export const Blockchain = new eip1558Blockchain()

import WalletUtils from '@verida/wallet-utils'
import algosdk from 'algosdk'
import * as ethers from 'ethers'

import { IBlockchain, WalletUtilsWallet } from './IBlockchain'

class algorandBlockchain implements IBlockchain {
  public buildAccountFromMnemonic(
    mnemonic: string,
    derivationPath: string,
    multiChain: boolean
  ): WalletUtilsWallet {
    if (multiChain) {
      mnemonic = this.buildMnemonicFromMultiChainMnemonic(
        mnemonic,
        derivationPath
      )
    }
    return WalletUtils.utils.getWallet('algo', mnemonic)
  }

  public buildMnemonicFromMultiChainMnemonic(
    multichainMnemonic: string,
    derivationPath: string
  ) {
    const node = ethers.utils.HDNode.fromMnemonic(multichainMnemonic)
    const childNode = node.derivePath(derivationPath)
    return algosdk.mnemonicFromSeed(
      Buffer.from(childNode.privateKey.slice(2), 'hex')
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public buildAccountFromPrivateKey(privateKey: string): WalletUtilsWallet {
    throw new Error(
      'Creating Algorand account from private key is not supported'
    )
  }
}

export const Blockchain = new algorandBlockchain()

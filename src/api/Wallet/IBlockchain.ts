import { BlockchainAccount } from 'api/types'

export interface WalletUtilsWallet {
  chain: string
  mnemonic: string
  privateKey: string
  publicKey: string
  did: did
  address: string
}

export interface IBlockchain {
  buildAccountFromMnemonic(
    mnemonic: string,
    derivationPath: string,
    multiChain: boolean
  ): WalletUtilsWallet

  buildAccountFromPrivateKey(privateKey: string): WalletUtilsWallet
}

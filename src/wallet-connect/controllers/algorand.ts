/* eslint-disable no-console */
import algosdk, { Account } from 'algosdk'

import { store } from '../../reduxStore'
import { getWalletsData } from '../../reduxStore/wallet/selectors'

export class AlgorandWalletController {
  public account: Account

  constructor() {
    this.account = this.init()
  }

  public isActive() {
    if (!this.account) {
      return this.account
    }
    return null
  }

  public init(): Account {
    const wallets = getWalletsData(store.getState().main)
    const mnemonic = wallets.algo.mnemonic
    const wallet = algosdk.mnemonicToSecretKey(mnemonic)

    return wallet
  }

  public async signTransaction(txns: any, _message: any) {
    let success = true
    const result: Array<Uint8Array | null> = []

    for (const walletTxn of txns) {
      const shouldSign =
        walletTxn.signers == null || walletTxn.signers.length !== 0

      if (!shouldSign) {
        console.log(`Txn ${walletTxn.txn.txID()} received, no sig required`)
        result.push(null)
        continue
      }

      if (
        (walletTxn.signers && walletTxn.signers.length > 1) ||
        walletTxn.msig
      ) {
        success = false
        console.log(`Txn is multisig`)
        result.push(null)
        continue
      }

      const signer = walletTxn.signers
        ? walletTxn.signers[0]
        : algosdk.encodeAddress(walletTxn.txn.from.publicKey)

      console.log('Signer:', signer, this.account.addr, this.account)

      if (signer !== this.account.addr) {
        success = false
        console.log(`Txn ${walletTxn.txn.txID()} has unknown signer: ${signer}`)
        result.push(null)
        continue
      }

      console.log(
        `Txn ${walletTxn.txn.txID()} received, signing with ${signer}`
      )

      const signedTxn = walletTxn.txn.signTxn(this.account.sk)
      result.push(signedTxn)
    }

    if (success) {
      return result
    }

    throw new Error('Transaction signing not successful')
  }
}

export function getAlgorandWalletController() {
  return new AlgorandWalletController()
}

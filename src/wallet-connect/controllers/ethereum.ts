import '@ethersproject/shims'

import { signTypedData_v4 } from 'eth-sig-util'
import * as ethers from 'ethers'
import { getWalletsData } from 'features/wallets'

import { store } from '../../reduxStore'
import { ethereumWeb3 as web3 } from '../../wallet/chains/eip155'
import { getWalletConnectConfig } from '../config'
import {
  DEFAULT_ACTIVE_INDEX,
  DEFAULT_CHAIN_ID,
  DEFAULT_GAS_LIMIT,
  ETH_CHAIN_TESTNET,
} from '../constants/default'
import { getChainData } from '../helpers/utilities'
import { IEtherWalletController } from './type'

export class EthereumWalletController implements IEtherWalletController {
  public path: string
  public wallet: ethers.Wallet

  public activeIndex: number = DEFAULT_ACTIVE_INDEX
  public activeChainId: number = DEFAULT_CHAIN_ID

  constructor() {
    this.path = this.getPath()
    this.wallet = this.init()
  }

  getProvider(): ethers.providers.Provider {
    return this.wallet.provider
  }

  public getControllerType(): string {
    return ETH_CHAIN_TESTNET
  }

  public isActive() {
    if (!this.wallet) {
      return this.wallet
    }
    return null
  }

  public getIndex() {
    return this.activeIndex
  }

  public getWallet(index?: number, chainId?: number): ethers.Wallet {
    if (
      !this.wallet ||
      this.activeIndex === index ||
      this.activeChainId === chainId
    ) {
      return this.init(index, chainId)
    }
    return this.wallet
  }

  public getPath(index: number = this.activeIndex) {
    this.path = `${getWalletConnectConfig().derivationPath}/${index}`
    return this.path
  }

  public generateWallet(index: number) {
    const wallets = getWalletsData(store.getState())

    if (!wallets[this.getControllerType()!]) {
      throw new Error('No active account')
    }

    const mnemonic = wallets[this.getControllerType()!].mnemonic
    this.wallet = ethers.Wallet.fromMnemonic(mnemonic, this.getPath(index))
    return this.wallet
  }

  public init(
    index = DEFAULT_ACTIVE_INDEX,
    chainId = DEFAULT_CHAIN_ID
  ): ethers.Wallet {
    return this.update(index, chainId)
  }

  public update(index: number, chainId: number): ethers.Wallet {
    const firstUpdate = typeof this.wallet === 'undefined'
    this.activeIndex = index
    this.activeChainId = chainId
    const rpcUrl = getChainData(chainId).rpc_url
    const wallet = this.generateWallet(index)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    this.wallet = wallet.connect(provider)
    if (!firstUpdate) {
      // update another controller if necessary here
    }
    return this.wallet
  }

  public async populateTransaction(transaction: any) {
    let tx = { ...transaction }
    if (this.wallet) {
      if (tx.gas) {
        tx.gasLimit = tx.gas
        delete tx.gas
      }

      if (tx.from) {
        tx.from = ethers.utils.getAddress(tx.from)
      }

      // If empty fill in the default data
      if (!tx.data) {
        tx.data = '0x'
      }

      // eip-1559 transaction do not support gasPrice
      if (tx.gasPrice) {
        delete tx.gas
      }

      try {
        tx = await this.wallet.populateTransaction(tx)
        tx.gasLimit = tx.gasLimit
          ? ethers.BigNumber.from(tx.gasLimit).toHexString()
          : ethers.utils.hexlify(DEFAULT_GAS_LIMIT)

        tx.nonce = await web3.eth.getTransactionCount(transaction.from)
      } catch (err) {
        throw new Error('Unable to populate transaction')
      }
    }

    return tx
  }

  public async sendTransaction(transaction: any) {
    if (this.wallet) {
      if (
        transaction.from &&
        transaction.from.toLowerCase() !== this.wallet.address.toLowerCase()
      ) {
        throw new Error("Transaction request From doesn't match active account")
      }

      if (transaction.from) {
        delete transaction.from
      }

      // ethers.js expects gasLimit instead
      if ('gas' in transaction) {
        transaction.gasLimit = transaction.gas
        delete transaction.gas
      }

      const result = await this.wallet.sendTransaction(transaction)
      return result.hash
    } else {
      throw new Error('No Active Account')
    }
  }

  public async signTransaction(data: any) {
    if (this.wallet) {
      if (data && data.from) {
        delete data.from
      }
      data.gasLimit = data.gas
      delete data.gas
      const result = await this.wallet.signTransaction(data)
      return result
    } else {
      throw new Error('No Active Account')
    }
  }

  public async signMessage(data: any) {
    if (this.wallet) {
      const signedMessage = await this.wallet.signMessage(
        ethers.utils.arrayify(data)
      )
      return signedMessage
    } else {
      throw new Error('No Active Account')
    }
  }

  public async signPersonalMessage(message: any) {
    if (this.wallet) {
      const result = await this.wallet.signMessage(
        ethers.utils.isHexString(message)
          ? ethers.utils.arrayify(message)
          : message
      )
      return result
    } else {
      throw new Error('No Active Account')
    }
  }

  public async signTypedData(data: any) {
    if (this.wallet) {
      const result = signTypedData_v4(
        Buffer.from(this.wallet.privateKey.slice(2), 'hex'),
        {
          data: JSON.parse(data),
        }
      )
      return result
    } else {
      throw new Error('No Active Account')
    }
  }
}

export function getEthereumWalletController() {
  return new EthereumWalletController()
}

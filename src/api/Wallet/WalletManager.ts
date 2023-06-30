import { store } from 'reduxStore'
import { WALLET_SCHEMA_0_2_0_URI } from 'wallet/constants'

import AccountManager from 'api/AccountManager'
import { getBlockchainNetworks } from 'reduxStore/selectors'

import {
  BlockchainAccount,
  BlockchainNetwork,
  BlockchainWallet,
  BlockchainWalletWithAccounts,
} from '../types'
import { Blockchain as algorandBlockchain } from './algorandBlockchain'
import { Blockchain as eip1558Blockchain } from './eip1558Blockchain'
import { IBlockchain, WalletUtilsWallet } from './IBlockchain'
import { Blockchain as nearBlockchain } from './nearBlockchain'

const bip39 = require('bip39')

const NAMESPACES: Record<string, IBlockchain> = {
  eip155: eip1558Blockchain,
  near: nearBlockchain,
  algorand: algorandBlockchain,
}

export class WalletManager {
  public static async getBlockchainAccounts(
    walletData: BlockchainWallet[]
  ): Promise<Record<string, BlockchainWalletWithAccounts>> {
    const blockchainNetworks = getBlockchainNetworks(store.getState())
    if (!blockchainNetworks) return {} // TODO: better way to handle this case

    const wallets: Record<string, BlockchainWalletWithAccounts> = {}
    walletData.forEach((wallet: BlockchainWallet | any) => {
      if (wallet.walletType !== 'multi') {
        wallet.multiChain = false
        // Convert imported testnet wallets using the old format
        // to proper CAIP addresses
        // This is for wallets created between 4 May 2023 and the next release
        switch (wallet.walletType) {
          case 'ethereum':
            wallet.chainId = 'eip155:5'
            break
          case 'algorand':
            wallet.chainId = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDe'
            break
          case 'polygon':
            wallet.chainId = 'eip155:80001'
            break
          case 'near':
            wallet.chainId = 'near:testnet'
            break
          default:
            wallet.chainId = wallet.walletType
            break
        }

        wallet.asset = blockchainNetworks[wallet.chainId]?.asset
        wallet.blockchainNetwork = blockchainNetworks[wallet.chainId]
      } else {
        wallet.multiChain = true
      }

      wallet.viewOnly = !wallet.mnemonic && !wallet.privateKey

      const updatedWallet: BlockchainWalletWithAccounts = {
        ...wallet,
        accounts: WalletManager.generateAccountsForWallet(
          wallet,
          Object.values(blockchainNetworks)
        ),
      }

      wallets[wallet._id] = updatedWallet
    })

    return wallets
  }

  public static generateAccountsForWallet(
    wallet: Partial<BlockchainWallet>,
    // TODO: We are misusing this type - we should just use use the result of getBlockchainNetworks()
    maybeBlockchainNetworks:
      | BlockchainNetwork[]
      | Record<string, BlockchainNetwork>
      | undefined
  ) {
    const blockchainNetworks = maybeBlockchainNetworks || {}

    const accounts: Record<string, BlockchainAccount> = {}

    Object.values(blockchainNetworks).forEach(
      (blockchainNetwork: BlockchainNetwork): void => {
        if (
          !wallet.multiChain &&
          blockchainNetwork.chainId !== wallet.chainId
        ) {
          return
        }

        // If we have a watch only wallet, simply return it
        if (wallet.address && !wallet.privateKey && !wallet.mnemonic) {
          const blockchainAccount: BlockchainAccount = {
            network: blockchainNetwork,
            chainId: blockchainNetwork.chainId,
            derivationPath: blockchainNetwork.derivationPath,
            address: wallet.address,
          }

          accounts[blockchainNetwork.chainId] = blockchainAccount
          return
        }

        if (!NAMESPACES[blockchainNetwork.namespace]) {
          // only support EIPP155 for now
          throw new Error(blockchainNetwork.chainId + 'is not supported')
        }

        const namespaceChain = NAMESPACES[blockchainNetwork.namespace]

        let walletDetails: WalletUtilsWallet
        if (wallet.privateKey) {
          walletDetails = namespaceChain.buildAccountFromPrivateKey(
            wallet.privateKey
          )
        } else if (wallet.mnemonic) {
          walletDetails = namespaceChain.buildAccountFromMnemonic(
            wallet.mnemonic,
            blockchainNetwork.derivationPath,
            Boolean(wallet.multiChain)
          )
        } else {
          throw new Error(
            'Unexpected wallet (No address, private key or mnemonic)'
          )
        }

        const blockchainAccount: BlockchainAccount = {
          network: blockchainNetwork,
          chainId: blockchainNetwork.chainId,
          derivationPath: blockchainNetwork.derivationPath,
          address: walletDetails.address,
          mnemonic: walletDetails.mnemonic,
          privateKey: walletDetails.privateKey,
        }

        accounts[blockchainNetwork.chainId] = blockchainAccount
      }
    )

    return accounts
  }

  public static generateMnemonic(): string {
    // generates random mnemonic
    const mnemonic = bip39.generateMnemonic()
    return mnemonic
  }

  public static async createNewWallet(
    seedPhrase?: string,
    name?: string
  ): Promise<{
    selectedWallet: BlockchainWallet
    wallets: Record<string, BlockchainWalletWithAccounts>
  }> {
    const mnemonic = seedPhrase ? seedPhrase : WalletManager.generateMnemonic()

    // save mnemonic to verida store
    const walletDb = await AccountManager.getInstance().context!.openDatastore(
      WALLET_SCHEMA_0_2_0_URI
    )

    const wallet = {
      mnemonic,
      multiChain: true,
      label: name ? name : 'Multi Chain Wallet',
      walletType: 'multi',
      viewOnly: false,
    }

    const saved: any = await walletDb!.save(wallet, undefined)
    if (!saved) {
      throw new Error(`Unable to save wallet: ${walletDb.errors[0].message}`)
    }

    const wallets = await WalletManager.getBlockchainAccounts(
      await walletDb!.getMany<BlockchainWallet>(undefined, undefined)
    )

    return {
      selectedWallet: wallets[saved.id],
      wallets,
    }
  }
}

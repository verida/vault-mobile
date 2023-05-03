import { store } from 'reduxStore'

import AccountManager from 'api/AccountManager'
import { getBlockchainNetworks } from 'reduxStore/selectors'

import { WALLET_SCHEMA_0_2_0_URI } from '../../wallet/constants'
import { Blockchain as eip1558Blockchain } from './eip1558Blockchain'
import { IBlockchain, WalletUtilsWallet } from './IBlockchain'
import {
  BlockchainAccount,
  BlockchainNetwork,
  BlockchainWallet,
  BlockchainWalletWithAccounts,
} from './types'
import { WalletProvider } from './WalletProvider'

const bip39 = require('bip39')

const NAMESPACES: Record<string, IBlockchain> = {
  eip155: eip1558Blockchain,
}

export class WalletManager {
  public static async getBlockchainAccounts(
    walletData: Record<string, BlockchainWallet>
  ): Promise<Record<string, BlockchainWalletWithAccounts>> {
    const blockchainNetworks = getBlockchainNetworks(store.getState())

    const wallets: Record<string, BlockchainWalletWithAccounts> = {}
    walletData.forEach((wallet: BlockchainWallet | any) => {
      if (wallet.walletType) {
        console.log(
          'trying to convert wallet, fix chainId for non multi chain wallets!'
        )
        console.log(wallet)
        // We have a wallet saved with the old format, need to update it
        wallet.multiChain = wallet.walletType === 'multi'
        // @todo: set wallet.chainId
      }

      const updatedWallet: BlockchainWalletWithAccounts = {
        ...wallet,
        accounts: WalletManager.generateAccountsForWallet(
          wallet,
          Object.values(blockchainNetworks)
        ),
      }

      /*{
        privateKey: wallet.privateKey ?? null,
        mnemonic: wallet.mnemonic ?? null,
        address: wallet.address ?? null,
        blockchainNetworks,
        chain: wallet.walletType === 'multi' ? null : wallet.walletType,
      })

      wallets[walletId] = {
        seedPhrase: wallet.mnemonic ?? null,
        privateKey: wallet.privateKey ?? null,
        type: wallet.walletType === 'multi' ? 'multi' : 'single',
        label: wallet.label,
        id: walletId,
        accounts,
        chain: wallet.walletType === 'multi' ? null : wallet.walletType,
      }*/

      wallets[wallet._id] = updatedWallet
    })

    return wallets
  }

  public static generateAccountsForWallet(
    wallet: BlockchainWallet,
    blockchainNetworks: BlockchainNetwork[]
  ) {
    const accounts: Record<string, BlockchainWalletWithAccounts> = {}

    Object.values(blockchainNetworks).forEach(
      (blockchainNetwork: BlockchainNetwork): BlockchainAccount => {
        if (
          !wallet.multiChain &&
          blockchainNetwork.chainId !== wallet.chainId
        ) {
          return
        }

        // If we have a watch only wallet, simply return it
        if (wallet.address && !wallet.privateKey && !wallet.mnemonic) {
          return wallet
        }

        if (!NAMESPACES[blockchainNetwork.namespace]) {
          // only support EIPP155 for now
          return
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
            blockchainNetwork.derivationPath
          )
        } else {
          console.error(wallet)
          throw new Error(
            'Unexpected wallet (No address, private key or mnemonic'
          )
        }

        const blockchainAccount: BlockchainAccount = {
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
    wallets: BlockchainWallet[]
  }> {
    const mnemonic = seedPhrase ? seedPhrase : WalletManager.generateMnemonic()

    // save mnemonic to verida store
    const walletDb = await AccountManager.getInstance().context!.openDatastore(
      WALLET_SCHEMA_0_2_0_URI
    )

    const wallet: BlockchainWallet = {
      mnemonic,
      multiChain: true,
      label: name ? name : 'Multi Chain Wallet',
    }

    const saved: any = await walletDb!.save(wallet)
    const wallets = await walletDb!.getMany()
    wallet._id = saved.id

    return {
      selectedWallet: wallet,
      wallets,
    }
  }

  /*

    // TODO: implement a switch
    if (chain === 'near') {
      const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
      const childNode = node.derivePath(path)
      wallet = WalletUtils.utils.getWallet('near', childNode.mnemonic.phrase)
    } else if (chain === 'algorand') {
      let algoMnemonic
      if (isHdWallet) {
        const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
        const childNode = node.derivePath(path)
        algoMnemonic = algosdk.mnemonicFromSeed(
          Buffer.from(childNode.privateKey.slice(2), 'hex')
        )
      } else {
        algoMnemonic = mnemonic
      }
      wallet = WalletUtils.utils.getWallet('algo', algoMnemonic)
    } else if (chain === 'eip155') {
      if (privateKey) {
        wallet = WalletUtils.utils.getWalletByPrivateKey('ethr', privateKey)
      } else {
        const node = ethers.utils.HDNode.fromMnemonic(mnemonic)
        const childNode = node.derivePath(path)
        wallet = WalletUtils.utils.getWallet('ethr', childNode.mnemonic.phrase)
      }
    }

    return wallet
  */
}

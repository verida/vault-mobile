import { IDatastore } from '@verida/types'

import {
  BlockchainAccount,
  BlockchainNetwork,
  BlockchainWallet,
  BlockchainWalletWithAccounts,
  getBlockchainNetworks,
  IBlockchain,
  WalletUtilsWallet,
} from '~/features/blockchain'
import { eip155Blockchain } from '~/features/blockchain/eip155'
import { nearBlockchain } from '~/features/blockchain/near'
import { isSupportedCaipNamespace } from '~/features/caip'
import { Logger } from '~/features/telemetry'
import * as SecureStore from '~/helpers/VeridaSecureStore'
import { store } from '~/reduxStore'

import {
  CRYPTO_WALLETS_STORAGE_KEY,
  DEFAULT_MULTI_CHAIN_WALLET_LABEL,
  SELECTED_CRYPTO_WALLET_STORAGE_KEY,
} from '../constants'

const logger = Logger.create('CryptoWallets')

const bip39 = require('bip39')

// TODO: @cawfree extend support
const NAMESPACES: Record<string, IBlockchain> = {
  eip155: eip155Blockchain,
  near: nearBlockchain,
}

// TODO: Temporary type, should be replaced with a proper type
type Result = {
  selectedWalletId: string | null
  wallets: Record<string, BlockchainWalletWithAccounts>
}

export class WalletManager {
  public static async createCryptoWallet(
    walletsDatastore: IDatastore,
    data: {
      phrase?: string
      label?: string
    } // TODO: Type as a subset of the wallet model
    // TODO: Add optional blockchain namespace
  ): Promise<Result> {
    const mnemonic = data.phrase
      ? data.phrase
      : WalletManager.generateMnemonic()

    // TODO: Add a type
    const wallet = {
      mnemonic,
      multiChain: true,
      label: data.label ? data.label : DEFAULT_MULTI_CHAIN_WALLET_LABEL,
      walletType: 'multi',
      viewOnly: false,
    }

    // TODO: Factorise the build of the record and the actual save

    // TODO: Add zod validation here
    const savedRecord: any = await walletsDatastore.save(wallet, {})
    // TODO: Add zod validation to get the proper type
    if (!savedRecord) {
      throw new Error(`Error saving crypto wallet to Vault datastore`)
    }

    const walletId = savedRecord.id
    return await WalletManager.restoreCryptoWallets(walletsDatastore, walletId)
  }

  public static async importCryptoWallet(
    walletsDatastore: IDatastore,
    data: {
      name: string
      inputSwitch: string
      phrase: string
      walletType: string
      privateKey: string
    } // TODO: Type as a subset of the wallet model
  ): Promise<Result> {
    const mnemonic = data.inputSwitch === 'seedPhrase' ? data.phrase : null
    const privateKey =
      data.inputSwitch === 'privateKey' ? data.privateKey : null
    const walletType = data.walletType

    // TODO: Set proper type
    const wallet: Partial<BlockchainWallet> = {
      walletType,
      label: data.name,
    }
    if (mnemonic) wallet.mnemonic = mnemonic
    if (privateKey) wallet.privateKey = privateKey

    // TODO: Factorise the build of the record and the actual save

    // TODO: Add zod validation here
    const savedRecord: any = await walletsDatastore.save(wallet, {})
    // TODO: Add zod validation to get the proper type

    if (!savedRecord) {
      throw new Error(`Error saving crypto wallet to Vault datastore`)
    }

    const walletId = savedRecord.id
    return await WalletManager.restoreCryptoWallets(walletsDatastore, walletId)
  }

  public static async addWatchedCryptoWallet(
    walletsDatastore: IDatastore,
    data: {
      label: string
      blockchain: string
      publicAddress: string
    } // TODO: Type as a subset of the wallet model
  ): Promise<Result> {
    // TODO: Add a type
    const wallet = {
      label: data.label,
      walletType: data.blockchain,
      address: data.publicAddress,
    }

    // TODO: Factorise the build of the record and the actual save

    // TODO: Add zod validation here
    const savedRecord: any = await walletsDatastore.save(wallet, {})
    // TODO: Add zod validation to get the proper type

    if (!savedRecord) {
      throw new Error(`Error saving crypto wallet to Vault datastore`)
    }

    const walletId = savedRecord.id
    return await WalletManager.restoreCryptoWallets(walletsDatastore, walletId)
  }

  public static async deleteCryptoWallet(
    walletsDatastore: IDatastore,
    walletId: string,
    currentlySelectedWalletId: string | null
  ): Promise<Result> {
    await walletsDatastore.delete(walletId)

    return await WalletManager.restoreCryptoWallets(
      walletsDatastore,
      currentlySelectedWalletId
    )
  }

  public static async renameCryptoWallet(
    walletsDatastore: IDatastore,
    walletId: string,
    data: { name: string } // TODO: Type as a subset of the wallet model
  ): Promise<Result> {
    const foundRecord: any = await walletsDatastore.get(walletId, {})
    if (!foundRecord) {
      throw new Error(`Crypto wallet not found`)
    }

    // TODO: Add a type
    const updatedRecord = {
      ...foundRecord,
      label: data.name,
    }

    // TODO: Factorise the build of the record and the actual save

    // TODO: Add zod validation before saving
    await walletsDatastore.save(updatedRecord, {})

    return await WalletManager.restoreCryptoWallets(walletsDatastore, null)
  }

  public static async restoreCryptoWallets(
    walletsDatastore: IDatastore,
    walletIdToSelect: string | null
  ): Promise<Result> {
    try {
      // Clearing the local storage, mostly to clean up the now unused data
      // The wallet used to be locally stored under the key CRYPTO_WALLETS_STORAGE_KEY
      // But it's now longer used, so we don't want to keep this orphan data around, especially as it contains sensitive info
      await WalletManager.clearCachedCryptoWallets()

      const storedWallets: BlockchainWallet[] =
        (await walletsDatastore?.getMany(
          undefined,
          undefined
        )) as BlockchainWallet[]
      // TODO: Add zod validation here

      if (storedWallets.length === 0) {
        return {
          selectedWalletId: null,
          wallets: {},
        }
      }

      const wallets = await WalletManager.getBlockchainAccounts(storedWallets)

      const cachedSelectedCryptoWalletId = await SecureStore.getItemAsync(
        SELECTED_CRYPTO_WALLET_STORAGE_KEY
      )

      const selectedId = walletIdToSelect || cachedSelectedCryptoWalletId

      const previouslySelectedWallet = selectedId
        ? wallets[selectedId]
        : undefined

      const selectedWalletId = previouslySelectedWallet
        ? previouslySelectedWallet._id
        : storedWallets[0]._id

      if (selectedWalletId) {
        SecureStore.setItemAsync(
          SELECTED_CRYPTO_WALLET_STORAGE_KEY,
          selectedWalletId
        )
      } else {
        SecureStore.deleteItemAsync(SELECTED_CRYPTO_WALLET_STORAGE_KEY)
      }

      return {
        selectedWalletId: selectedWalletId ?? null,
        wallets,
      }
    } catch (error) {
      throw new Error('Error restoring crypto wallets', { cause: error })
    }
  }

  public static async clearCachedCryptoWallets() {
    await Promise.all([
      SecureStore.deleteItemAsync(SELECTED_CRYPTO_WALLET_STORAGE_KEY),

      // CRYPTO_WALLETS_STORAGE_KEY is no longer used, but we want to clean up potential remaining data from olver versions.
      SecureStore.deleteItemAsync(CRYPTO_WALLETS_STORAGE_KEY),
    ])
  }

  public static async selectCryptoWallet(walletId: string) {
    await SecureStore.setItemAsync(SELECTED_CRYPTO_WALLET_STORAGE_KEY, walletId)
  }

  public static async getBlockchainAccounts(
    walletData: BlockchainWallet[]
  ): Promise<Record<string, BlockchainWalletWithAccounts>> {
    const blockchainNetworks = getBlockchainNetworks(store.getState()) // TODO: Deal with how to handle it in a pure function
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
        // HACK: It is possible that a user may have access to unsupported
        //       wallets, for example, an algorand wallet, which was
        //       previously supported. Here we filter out the unsupported wallet
        //       to prevent the application from having to deal with instances
        //       it doesn't support natively further downstream.
        if (!isSupportedCaipNamespace(blockchainNetwork.namespace)) {
          logger.warn(
            `Refusing to process "${blockchainNetwork.chainId}", since it is no longer supported.`
          )
          return
        }

        if (
          !wallet.multiChain &&
          blockchainNetwork.chainId !== wallet.chainId
        ) {
          return
        }

        // If we have a watch only wallet, simply return it
        if (wallet.address && !wallet.privateKey && !wallet.mnemonic) {
          const blockchainAccount: BlockchainAccount = {
            blockchainNetwork,
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
          blockchainNetwork,
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
    return bip39.generateMnemonic()
  }
}

import { IDatastore } from '@verida/types'
import * as bip39 from 'bip39'

import {
  BlockchainAccount,
  BlockchainNetwork,
  BlockchainWalletWithAccounts,
  getBlockchainNetworks,
  IBlockchain,
  WalletUtilsWallet,
} from '~/features/blockchain'
import { eip155Blockchain } from '~/features/blockchain/eip155'
import { nearBlockchain } from '~/features/blockchain/near'
import { isSupportedCaipNamespace } from '~/features/caip'
import { Logger } from '~/features/telemetry'
import { VeridaSaveRecordResult } from '~/features/verida'
import * as SecureStore from '~/helpers/VeridaSecureStore'
import { store } from '~/reduxStore'

import {
  CRYPTO_WALLETS_STORAGE_KEY,
  DEFAULT_MULTI_CHAIN_WALLET_LABEL,
  DEFAULT_SINGLE_CHAIN_WALLET_LABEL,
  SELECTED_CRYPTO_WALLET_STORAGE_KEY,
} from '../constants'
import { BaseCryptoWalletSchema, CryptoWalletRecordsSchema } from '../schemas'
import {
  AddWatchedCryptoWallet,
  BaseCryptoWallet,
  CreateCryptoWalletData,
  CryptoWalletRecord,
  ImportCryptoWalletData,
  UpdateCryptoWalletData,
} from '../types'

const logger = Logger.create('CryptoWallets')

// TODO: Move into blockchain feature
const NAMESPACES: Record<string, IBlockchain> = {
  eip155: eip155Blockchain,
  near: nearBlockchain,
}

async function saveCryptoWalletRecord(
  walletsDatastore: IDatastore,
  wallet: BaseCryptoWallet | CryptoWalletRecord
) {
  BaseCryptoWalletSchema.parse(wallet) // TODO: Handle validation errors

  const result: VeridaSaveRecordResult = (await walletsDatastore.save(
    wallet,
    {}
  )) as VeridaSaveRecordResult // TODO: Update the SDK for better typing

  if (!result?.ok) {
    throw new Error(`Error saving crypto wallet record to Vault datastore`)
  }

  return result
}

export class WalletManager {
  public static async createCryptoWallet(
    walletsDatastore: IDatastore,
    data: CreateCryptoWalletData
  ) {
    const { label, walletType, mnemonic } = data

    const wallet: BaseCryptoWallet = {
      ...data,
      label: label
        ? label
        : !walletType || walletType === 'multi'
          ? DEFAULT_MULTI_CHAIN_WALLET_LABEL
          : DEFAULT_SINGLE_CHAIN_WALLET_LABEL,
      walletType: walletType || 'multi',
      mnemonic: mnemonic || bip39.generateMnemonic(),
    }

    const result = await saveCryptoWalletRecord(walletsDatastore, wallet)
    const walletId = result.id

    return await WalletManager.restoreCryptoWallets(walletsDatastore, walletId)
  }

  public static async importCryptoWallet(
    walletsDatastore: IDatastore,
    data: ImportCryptoWalletData
  ) {
    const { label, walletType } = data

    const wallet: BaseCryptoWallet = {
      ...data,
      label: label
        ? label
        : !walletType || walletType === 'multi'
          ? DEFAULT_MULTI_CHAIN_WALLET_LABEL
          : DEFAULT_SINGLE_CHAIN_WALLET_LABEL,
      walletType: walletType || 'multi',
    }

    const result = await saveCryptoWalletRecord(walletsDatastore, wallet)
    const walletId = result.id

    return await WalletManager.restoreCryptoWallets(walletsDatastore, walletId)
  }

  public static async addWatchedCryptoWallet(
    walletsDatastore: IDatastore,
    data: AddWatchedCryptoWallet
  ) {
    const { label, walletType } = data

    const wallet: BaseCryptoWallet = {
      ...data,
      label: label
        ? label
        : !walletType || walletType === 'multi'
          ? DEFAULT_MULTI_CHAIN_WALLET_LABEL
          : DEFAULT_SINGLE_CHAIN_WALLET_LABEL,
    }

    const result = await saveCryptoWalletRecord(walletsDatastore, wallet)
    const walletId = result.id

    return await WalletManager.restoreCryptoWallets(walletsDatastore, walletId)
  }

  public static async deleteCryptoWallet(
    walletsDatastore: IDatastore,
    walletId: string,
    currentlySelectedWalletId: string | null
  ) {
    await walletsDatastore.delete(walletId)

    return await WalletManager.restoreCryptoWallets(
      walletsDatastore,
      currentlySelectedWalletId
    )
  }

  public static async updateCryptoWallet(
    walletsDatastore: IDatastore,
    walletId: string,
    data: UpdateCryptoWalletData
  ) {
    const foundRecord: CryptoWalletRecord | undefined =
      await walletsDatastore.get(walletId, {})

    if (!foundRecord) {
      throw new Error(`Crypto wallet not found`)
    }

    const updatedRecord: CryptoWalletRecord = {
      ...foundRecord,
      ...data,
    }

    await saveCryptoWalletRecord(walletsDatastore, updatedRecord)

    return await WalletManager.restoreCryptoWallets(walletsDatastore, null)
  }

  public static async restoreCryptoWallets(
    walletsDatastore: IDatastore,
    walletIdToSelect: string | null
  ): Promise<{
    selectedWalletId: string | null
    wallets: Record<string, BlockchainWalletWithAccounts>
  }> {
    try {
      // Clearing the local storage, mostly to clean up the now unused data
      // The wallet used to be locally stored under the key CRYPTO_WALLETS_STORAGE_KEY
      // But it's now longer used, so we don't want to keep this orphan data around, especially as it contains sensitive info
      await WalletManager.clearCachedCryptoWallets()

      const storedWallets = await walletsDatastore?.getMany(
        undefined,
        undefined
      )

      // TODO: Handle validation errors
      const validRecords = CryptoWalletRecordsSchema.parse(storedWallets)

      if (validRecords.length === 0) {
        return {
          selectedWalletId: null,
          wallets: {},
        }
      }

      const wallets =
        await WalletManager.transformRecordToCryptoWallets(validRecords)

      const cachedSelectedCryptoWalletId = await SecureStore.getItemAsync(
        SELECTED_CRYPTO_WALLET_STORAGE_KEY
      )

      const selectedId = walletIdToSelect || cachedSelectedCryptoWalletId

      const previouslySelectedWallet = selectedId
        ? wallets[selectedId]
        : undefined

      const selectedWalletId = previouslySelectedWallet
        ? previouslySelectedWallet._id
        : validRecords[0]._id

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

  private static async transformRecordToCryptoWallets(
    records: CryptoWalletRecord[]
  ): Promise<Record<string, BlockchainWalletWithAccounts>> {
    const blockchainNetworks = getBlockchainNetworks(store.getState()) // TODO: Deal with how to handle it in a pure function
    if (!blockchainNetworks) return {} // TODO: better way to handle this case

    const wallets: Record<string, BlockchainWalletWithAccounts> = {}

    records.forEach((record) => {
      const chainId = getChainIdFromWalletType(record.walletType)

      const blockchainNetwork =
        record.walletType !== 'multi' ? blockchainNetworks[chainId] : undefined

      const accounts = WalletManager.generateAccountsForWallet(
        record,
        Object.values(blockchainNetworks)
      )

      const addresses = Object.values(accounts).map((account) => {
        return account.address
      })

      const wallet: BlockchainWalletWithAccounts = {
        _id: record._id,
        label: record.label,
        walletType: record.walletType,
        multiChain: record.walletType === 'multi',
        viewOnly: !record.mnemonic && !record.privateKey,
        count: Object.keys(accounts).length,
        icon: blockchainNetwork?.icon,
        address: addresses.length === 1 ? addresses[0] : undefined,
        accounts,
        blockchainNetwork,
        // asset: blockchainNetworks[chainId]?.asset,
      }

      wallets[wallet._id] = wallet
    })

    return wallets
  }

  private static generateAccountsForWallet(
    walletRecord: CryptoWalletRecord,
    // TODO: We are misusing this type - we should just use use the result of getBlockchainNetworks()
    maybeBlockchainNetworks:
      | BlockchainNetwork[]
      | Record<string, BlockchainNetwork>
      | undefined
  ) {
    const walletChainId = getChainIdFromWalletType(walletRecord.walletType)

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
          walletRecord.walletType !== 'multi' &&
          blockchainNetwork.chainId !== walletChainId
        ) {
          return
        }

        // If we have a watch only wallet, simply return it
        if (
          walletRecord.address &&
          !walletRecord.privateKey &&
          !walletRecord.mnemonic
        ) {
          const blockchainAccount: BlockchainAccount = {
            blockchainNetwork,
            chainId: blockchainNetwork.chainId,
            derivationPath: blockchainNetwork.derivationPath,
            address: walletRecord.address,
          }

          accounts[blockchainNetwork.chainId] = blockchainAccount
          return
        }

        if (!NAMESPACES[blockchainNetwork.namespace]) {
          throw new Error(blockchainNetwork.chainId + 'is not supported')
        }

        const namespaceChain = NAMESPACES[blockchainNetwork.namespace]

        let walletDetails: WalletUtilsWallet

        if (walletRecord.privateKey) {
          walletDetails = namespaceChain.buildAccountFromPrivateKey(
            walletRecord.privateKey
          )
        } else if (walletRecord.mnemonic) {
          walletDetails = namespaceChain.buildAccountFromMnemonic(
            walletRecord.mnemonic,
            blockchainNetwork.derivationPath,
            Boolean(walletRecord.walletType === 'multi')
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
}

/**
 * Convert old values of walletType to chainId
 */
function getChainIdFromWalletType(walletType: string) {
  // Convert imported testnet wallets using the old format
  // to proper CAIP addresses
  // This is for wallets created between 4 May 2023 and the next release
  switch (walletType) {
    case 'ethereum':
      return 'eip155:5'
    case 'polygon':
      return 'eip155:80001'
    case 'near':
      return 'near:testnet'
    default:
      return walletType
  }
}

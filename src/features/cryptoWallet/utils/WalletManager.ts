import { IDatastore } from '@verida/types'
import * as bip39 from 'bip39'

import {
  BlockchainNetwork,
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
import {
  BaseCryptoWalletRecordSchema,
  CryptoWalletRecordsSchema,
} from '../schemas'
import {
  AddWatchedCryptoWallet,
  BaseCryptoWalletRecord,
  BlockchainAccount,
  BlockchainWalletWithAccounts,
  CreateCryptoWalletData,
  CryptoWalletRecord,
  ImportCryptoWalletData,
  UpdateCryptoWalletData,
  WalletType,
} from '../types'

const logger = Logger.create('CryptoWallets')

// TODO: Move into blockchain feature
const NAMESPACES: Record<string, IBlockchain> = {
  eip155: eip155Blockchain,
  near: nearBlockchain,
}

async function saveCryptoWalletRecord(
  walletsDatastore: IDatastore,
  wallet: BaseCryptoWalletRecord | CryptoWalletRecord
) {
  BaseCryptoWalletRecordSchema.parse(wallet) // TODO: Handle validation errors

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

  public static async createCryptoWallet(
    walletsDatastore: IDatastore,
    data: CreateCryptoWalletData
  ) {
    const { label, walletType, mnemonic } = data

    const wallet: BaseCryptoWalletRecord = {
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

    const wallet: BaseCryptoWalletRecord = {
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

    const wallet: BaseCryptoWalletRecord = {
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
        : validRecords[0]._id // TODO: Replace with the wallets variable when it's an array

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

  private static async transformRecordToCryptoWallets(
    records: CryptoWalletRecord[]
  ): Promise<Record<string, BlockchainWalletWithAccounts>> {
    const blockchainNetworks = getBlockchainNetworks(store.getState()) // TODO: Deal with how to handle it in a pure function
    if (!blockchainNetworks) return {} // TODO: better way to handle this case

    const wallets: Record<string, BlockchainWalletWithAccounts> = {}

    records.forEach((record) => {
      // TODO: We need to migrate the wallet type to the new format for existing records
      const newWalletType = getWalletTypeFromLegacy(record.walletType)

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
        walletType: newWalletType,
        viewOnly: !record.mnemonic && !record.privateKey,
        count: Object.keys(accounts).length,
        address: addresses.length === 1 ? addresses[0] : undefined,
        accounts,
      }

      wallets[wallet._id] = wallet
    })

    return wallets
  }

  private static generateAccountsForWallet(
    walletRecord: CryptoWalletRecord,
    blockchainNetworks: BlockchainNetwork[] = []
  ) {
    const accounts: Record<string, BlockchainAccount> = {}

    const newWalletType = getWalletTypeFromLegacy(walletRecord.walletType)

    blockchainNetworks.forEach((blockchain): void => {
      if (
        newWalletType !== 'multi' &&
        !isSupportedCaipNamespace(newWalletType)
      ) {
        logger.warn(`Blockchain namespace not supported: "${newWalletType}"`)
        return
      }

      if (!NAMESPACES[blockchain.namespace]) {
        throw new Error(
          `Blockchain namespace not supported: "${blockchain.namespace}"`
        )
      }

      if (newWalletType !== 'multi' && blockchain.namespace !== newWalletType) {
        return
      }

      // If we have a watch only wallet, simply return it
      if (
        walletRecord.address &&
        !walletRecord.privateKey &&
        !walletRecord.mnemonic
      ) {
        const blockchainAccount: BlockchainAccount = {
          chainId: blockchain.chainId,
          address: walletRecord.address,
        }

        accounts[blockchain.chainId] = blockchainAccount
        return
      }

      const namespaceChain = NAMESPACES[blockchain.namespace]

      let walletDetails: WalletUtilsWallet

      if (walletRecord.privateKey) {
        walletDetails = namespaceChain.buildAccountFromPrivateKey(
          walletRecord.privateKey
        )
      } else if (walletRecord.mnemonic) {
        walletDetails = namespaceChain.buildAccountFromMnemonic(
          walletRecord.mnemonic,
          blockchain.derivationPath,
          Boolean(walletRecord.walletType === 'multi')
        )
      } else {
        throw new Error(
          'Unexpected wallet (No address, private key or mnemonic)'
        )
      }

      const blockchainAccount: BlockchainAccount = {
        chainId: blockchain.chainId,
        address: walletDetails.address,
        privateKey: walletDetails.privateKey,
      }

      accounts[blockchain.chainId] = blockchainAccount
    })

    return accounts
  }
}

function getWalletTypeFromLegacy(walletType: string): WalletType {
  if (walletType.startsWith('eip155')) {
    return 'eip155'
  } else if (walletType.startsWith('near')) {
    return 'near'
  } else if (walletType === 'multi') {
    return 'multi'
  }
  throw new Error(`Unsupported wallet type: ${walletType}`)
}

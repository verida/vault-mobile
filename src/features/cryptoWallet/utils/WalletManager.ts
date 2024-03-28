import AccountManager from '~/api/AccountManager'
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
import { VAULT_SCHEMA_WALLETS_0_2_0 } from '~/features/veridaVault'
import * as SecureStore from '~/helpers/VeridaSecureStore'
import { store } from '~/reduxStore'

import {
  CRYPTO_WALLETS_STORAGE_KEY,
  DEFAULT_MULTI_CHAIN_WALLET_LABEL,
  SELECTED_CRYPTO_WALLET_STORAGE_KEY,
} from '../constants'

const logger = Logger.create('WalletManager')

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

  public static async createCryptoWallet(
    seedPhrase?: string,
    label?: string
  ): Promise<{
    selectedWallet: BlockchainWallet
    wallets: Record<string, BlockchainWalletWithAccounts>
  }> {
    const mnemonic = seedPhrase ? seedPhrase : WalletManager.generateMnemonic()

    // TODO: Move the AccountManager out of here
    const walletDb = await AccountManager.getInstance().context!.openDatastore(
      VAULT_SCHEMA_WALLETS_0_2_0
    )

    const wallet = {
      mnemonic,
      multiChain: true,
      label: label ? label : DEFAULT_MULTI_CHAIN_WALLET_LABEL,
      walletType: 'multi',
      viewOnly: false,
    }

    const saved: any = await walletDb!.save(wallet, undefined)
    if (!saved) {
      throw new Error(`Unable to save wallet: ${walletDb.errors[0].message}`)
    }

    const wallets = await WalletManager.getBlockchainAccounts(
      (await walletDb!.getMany(undefined, undefined)) as BlockchainWallet[]
    )

    return {
      selectedWallet: wallets[saved.id],
      wallets,
    }
  }

  public static async restoreCryptoWallets(
    previouslySelectedWalletId: string | null
  ): Promise<Result> {
    try {
      // TODO: Move the AccountManager out of here
      const walletsDatastore =
        await AccountManager.getInstance().context!.openDatastore(
          VAULT_SCHEMA_WALLETS_0_2_0
        )

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

      const previouslySelectedWallet = previouslySelectedWalletId
        ? wallets[previouslySelectedWalletId!]
        : undefined

      const selectedWalletId = previouslySelectedWallet
        ? previouslySelectedWalletId
        : storedWallets[0]._id

      await Promise.all([
        SecureStore.setItemAsync(
          CRYPTO_WALLETS_STORAGE_KEY,
          JSON.stringify(wallets)
        ),
        selectedWalletId
          ? SecureStore.setItemAsync(
              SELECTED_CRYPTO_WALLET_STORAGE_KEY,
              selectedWalletId
            )
          : SecureStore.deleteItemAsync(SELECTED_CRYPTO_WALLET_STORAGE_KEY),
      ])

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
      SecureStore.deleteItemAsync(CRYPTO_WALLETS_STORAGE_KEY),
    ])
  }
}

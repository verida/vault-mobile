// eslint-disable-next-line simple-import-sort/imports
import * as Sentry from '@sentry/react-native'
import { Client, Context } from '@verida/client-rn'
import { AutoAccount } from '@verida/account-node'
import Vault from './VaultCommon/vault'
import { ethers, utils } from 'ethers'
import * as SecureStore from 'helpers/VeridaSecureStore'
import { isEmpty, merge } from 'lodash'
import { store } from 'reduxStore'
import WalletUtils from '@verida/wallet-utils'

import {
  Account,
  AddIdentityStepStatus,
  AddIdentityStepType,
  BlockchainWallet,
  NormalizedAccounts,
  UserData,
} from 'api/types'
import dataMap from 'config/data-map'
import {
  addAccount,
  setAccounts,
  setSelectedAccount,
  setSwitchAccountToast,
} from 'reduxStore/general/actions'
import {
  removeUserWallets,
  saveUserWallets,
  setSelectedWallet,
} from 'reduxStore/wallet/actions'
import { getCountryCode } from 'utils/profile'
import { execWithTimeout } from 'api/utils'
import DataConnectorsManager from './DataConnectorsManager'

import CONFIG from '../config/environment'
import EventEmitter from 'events'
import { WALLET_SCHEMA_0_2_0_URI } from 'wallet/constants'
import { WalletManager } from './Wallet/WalletManager'
import { getBlockchainNetworks } from 'reduxStore/selectors'
import { getSelectedWalletId } from 'reduxStore/wallet/selectors'
import { IContext } from '@verida/types'
import { walletsApi } from 'features/cryptoWallet'

class AccountManager extends EventEmitter {
  // public selectedChain: string = DEFAULT_CHAIN
  public context: IContext | undefined
  public client: Client | undefined
  public vault: Vault | undefined
  public accounts: NormalizedAccounts
  private selectedAccount: Account | undefined

  private static instance: AccountManager

  private constructor() {
    super()
    this.accounts = {}
  }

  private async filterDids() {
    const hasInvalidData = Object.keys(this.accounts).some((did) => {
      return did.includes('did:3') || did.includes('did:vda:0x')
    })

    if (hasInvalidData) {
      this.accounts = {}
      await SecureStore.deleteItemAsync(CONFIG.ACCOUNTS_STORAGE_KEY)
      await SecureStore.deleteItemAsync(CONFIG.SELECTED_ACCOUNT_DID_STORAGE_KEY)

      AccountManager.getInstance().emit('ForcedDeleteAccounts', null)
    }
  }

  public async init() {
    try {
      if (!this.selectedAccount) {
        const [storedAccounts, storedSelectedAccountDid] = await Promise.all([
          SecureStore.getItemAsync(CONFIG.ACCOUNTS_STORAGE_KEY),
          SecureStore.getItemAsync(CONFIG.SELECTED_ACCOUNT_DID_STORAGE_KEY),
        ])

        if (storedAccounts) {
          this.accounts = JSON.parse(storedAccounts)
          // Sometimes if the app crashes when creating an account, it creates one that is empty
          // In that case, remove it so the app doesn't return to the create account screen
          // causing loss of access to all other accounts
          if (this.accounts['']) {
            delete this.accounts['']
          }
          await this.filterDids()
          store.dispatch(setAccounts(this.accounts))
        }

        const selectedAccountDid =
          storedSelectedAccountDid ||
          (Object.keys(this.accounts).length > 0
            ? this.accounts[Object.keys(this.accounts)[0]].did
            : undefined)

        if (!isEmpty(this.accounts) && selectedAccountDid) {
          this.selectedAccount = this.accounts[selectedAccountDid]
          store.dispatch(setSelectedAccount(this.selectedAccount))
        }

        // Load or restore user wallets from the mnemonic
        this.initUserWallets()
      }
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  private async initUserWallets() {
    try {
      const [walletsRaw, selectedWalletId] = await Promise.all([
        SecureStore.getItemAsync(CONFIG.WALLETS_STORAGE_KEY),
        SecureStore.getItemAsync(CONFIG.SELECTED_WALLET_STORAGE_KEY),
        store.dispatch(
          walletsApi.endpoints.chainsList.initiate(undefined, {
            forceRefetch: false,
          })
        ),
      ])

      const wallets = JSON.parse(walletsRaw || '{}')
      // No accounts available so needs to restore the wallets
      if (isEmpty(wallets?.[selectedWalletId!]?.accounts)) {
        const selectedAccount = this.getSelectedAccount()
        if (selectedAccount) {
          await this.connect()
        }
        await this.restoreUserWallet(true)
      } else {
        store.dispatch(saveUserWallets(wallets))
        store.dispatch(setSelectedWallet(selectedWalletId))
      }
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  public getSelectedAccount() {
    return this.selectedAccount
  }

  public async connect(forced = false) {
    if (!forced && this.context) {
      return
    }
    this.context = await this.getVeridaContext()
    this.vault = await this.getVault()
  }

  public static getInstance(): AccountManager {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager()
    }

    return AccountManager.instance
  }

  public async getVeridaContext(): Promise<IContext | undefined> {
    try {
      if (!this.selectedAccount) return undefined

      const environment = CONFIG.VERIDA_ENVIRONMENT

      this.client = new Client({
        environment,
        didClientConfig: {
          rpcUrl: CONFIG.VERIDA_DID_CLIENT_CONFIG.rpcUrl,
          network: environment,
        },
      })

      const { mnemonic } = this.selectedAccount

      // Use empty endpointUri's as they should already have been specified
      // when the account was created
      const didClientConfig = merge({}, CONFIG.VERIDA_DID_CLIENT_CONFIG)

      const account = new AutoAccount({
        privateKey: mnemonic,
        environment,
        didClientConfig,
      })

      // Fill the connected account with Verida DID
      let did
      if (isEmpty(this.selectedAccount.did)) {
        did = await account.did()
        await this.updateCurrentAccount({ did })
      }

      // Connect the Verida account to the Verida client
      await this.client.connect(account)

      // Open an application context
      const context = await this.client.openContext(
        CONFIG.VERIDA_CONTEXT_NAME,
        false
      )

      // Fetch the context config from the Vault and re-apply it to the account
      // so that any new login requests will have default config matching the vault.
      const contextConfig = await context!.getContextConfig(did, false)

      // Set account config to use the same nodes as the Vault
      // This ensures any newly created application contexts have the same nodes
      // @todo: Replace this with the ability for users to set their own default nodes
      account.setAccountConfig({
        defaultDatabaseServer: contextConfig.services.databaseServer,
        defaultMessageServer: contextConfig.services.messageServer,
        defaultNotificationServer: contextConfig.services.notificationServer,
      })

      // @todo: Do something useful with these messages
      // @ts-expect-error This event emitter interface is not documented.
      context!.on('EndpointUnavailable', (endpointUri: string) => {
        // eslint-disable-next-line no-console
        console.info(`Endpoint is currently unavailable: ${endpointUri}`)
      })

      // @todo: Do something useful with these messages
      // @ts-expect-error This event emitter interface is not documented.
      context!.on('EndpointWarning', (endpointUri: string, message: string) => {
        // eslint-disable-next-line no-console
        console.info(`Warning from endpoint ${endpointUri}: ${message}`)
      })

      return context
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public getClient() {
    return this.client
  }

  private async getVault() {
    try {
      const vault = new Vault(this.client, this.context, dataMap)
      await vault.init()
      return vault
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  private async setPublicProfile(data: UserData) {
    const entries = Object.entries(data)
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.vault?.profiles.public.set(...entry)
    }
    return true
  }

  public async setBackedupSeedPhraseConfig(backedup: boolean) {
    try {
      const configDb = await this.context?.openDatabase(CONFIG.CONFIG_DB)
      await configDb?.save(
        { _id: CONFIG.SEED_PHRASE_BACKED_UP_CONFIG, value: backedup },
        {}
      )
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public async getBackedupSeedPhraseConfig() {
    try {
      const configDb = await this.context?.openDatabase(CONFIG.CONFIG_DB)
      return await configDb?.get(CONFIG.SEED_PHRASE_BACKED_UP_CONFIG, {})
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public async setUserWallet() {
    try {
      await store.dispatch(removeUserWallets())
      const userHDWalletMnemonic = WalletManager.generateMnemonic()

      // save mnemonic to verida store
      const walletDb = await this.context?.openDatastore(
        WALLET_SCHEMA_0_2_0_URI
      )

      const wallet = {
        mnemonic: userHDWalletMnemonic,
        walletType: 'multi',
        label: 'Multi Coin Wallet',
        multiChain: true, // Set this's a multi-chain wallet
      }

      const saved: any = await walletDb?.save(wallet, undefined)

      const walletID = saved?.id

      // generate wallets and save to redux state
      const blockchainNetworks = getBlockchainNetworks(store.getState())

      const userGeneratedWallets = WalletManager.generateAccountsForWallet(
        { ...wallet } as BlockchainWallet,
        blockchainNetworks
      )

      const walletData = {
        [walletID]: {
          ...wallet,
          _id: walletID, // wallet saved id
          accounts: userGeneratedWallets,
        },
      }

      // Update redux wallet states
      store.dispatch(saveUserWallets(walletData))
      store.dispatch(setSelectedWallet(walletID))

      // save wallet state to secure storage
      await Promise.all([
        SecureStore.setItemAsync(
          CONFIG.WALLETS_STORAGE_KEY,
          JSON.stringify(walletData)
        ),
        SecureStore.setItemAsync(CONFIG.SELECTED_WALLET_STORAGE_KEY, walletID),
      ])
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public async restoreUserWallet(clearWallets: boolean) {
    try {
      if (clearWallets) {
        await store.dispatch(removeUserWallets())
      }

      const datastore = await this.context?.openDatastore(
        WALLET_SCHEMA_0_2_0_URI
      )

      const hdWallets: any = await datastore?.getMany<BlockchainWallet>(
        undefined,
        undefined
      )

      if (!isEmpty(hdWallets)) {
        const wallets = await WalletManager.getBlockchainAccounts(hdWallets)
        store.dispatch(saveUserWallets(wallets))

        // save to storage..
        await SecureStore.setItemAsync(
          CONFIG.WALLETS_STORAGE_KEY,
          JSON.stringify(wallets)
        )

        const currentlySelectedWallet = getSelectedWalletId(
          store.getState().main
        )

        if (clearWallets || (!currentlySelectedWallet && hdWallets[0])) {
          const selectedWalletID = hdWallets[0]._id

          store.dispatch(setSelectedWallet(selectedWalletID))

          await SecureStore.setItemAsync(
            CONFIG.SELECTED_WALLET_STORAGE_KEY,
            selectedWalletID
          )
        }
      }
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public async createAccount(
    userData: UserData,
    country: string,
    updateProgress?: (
      step: AddIdentityStepType,
      status: AddIdentityStepStatus
    ) => void
  ): Promise<Account | undefined> {
    let connected = false
    try {
      updateProgress?.('CreateIdentifier', 'Loading')

      const node = utils.entropyToMnemonic(utils.randomBytes(16))
      const wallet = ethers.Wallet.fromMnemonic(node)
      const privateKey = wallet.privateKey

      this.selectedAccount = {
        mnemonic: node,
        privateKey,
        did: '', // DID will be filled after connecting to Verida
        seedPhraseReminder: {
          lastTime: undefined,
          backedup: false,
        },
      }

      const didClientConfig = merge({}, CONFIG.VERIDA_DID_CLIENT_CONFIG, {
        veridaKey: this.selectedAccount.privateKey,
      })

      const { mnemonic } = this.selectedAccount

      const environment = CONFIG.VERIDA_ENVIRONMENT

      this.client = new Client({
        environment,
        didClientConfig: {
          rpcUrl: CONFIG.VERIDA_DID_CLIENT_CONFIG.rpcUrl,
          network: environment,
        },
      })

      const account = new AutoAccount({
        privateKey: mnemonic,
        environment,
        didClientConfig,
      })

      // Load suitable node based on selected country
      const countryCode = getCountryCode(country)

      await account.loadDefaultStorageNodes(countryCode, 3, {
        network: environment,
        notificationEndpoints: [...CONFIG.NOTIFICATION_ENDPOINTS],
      })

      // Connect the Verida account to the Verida client
      await this.client.connect(account)

      // Open the Vault context, forcing its creation
      this.context = <Context>(
        await this.client.openContext(CONFIG.VERIDA_CONTEXT_NAME, true)
      )

      // Set the Vault
      this.vault = await this.getVault()

      // Fill the connected account with Verida DID
      if (isEmpty(this.selectedAccount.did)) {
        const did = await account.did()
        await this.updateCurrentAccount({ did })
      }

      connected = true

      updateProgress?.('CreateIdentifier', 'Success')
      // just a nice UI delay, smooth state tranisition
      setTimeout(() => {
        updateProgress?.('StorageLocation', 'Success')
      }, 1000)

      updateProgress?.('CreateProfile', 'Loading')

      const setPublicProfileSuccess = await execWithTimeout(
        this.setPublicProfile(userData),
        100000
      )

      if (!setPublicProfileSuccess) {
        updateProgress?.('CreateProfile', 'Failure')
        throw new Error('Failed to set public profile')
      }

      store.dispatch(setSelectedAccount(this.selectedAccount))
      store.dispatch(addAccount(this.selectedAccount))

      await this.setUserWallet()
      // At this point can consider DID and Profile are created successfully
      // so we just finish this function and do these heavy tasks below asynchronously
      setTimeout(async () => {
        await this.setBackedupSeedPhraseConfig(false)
      }, 0)

      updateProgress?.('CreateProfile', 'Success')

      return this.selectedAccount
    } catch (e) {
      updateProgress?.('CreateProfile', 'Failure')

      // If the corrupted account is already connected, we need to remove it
      if (connected && this.selectedAccount)
        await this.logout([this.selectedAccount.did])

      Sentry.captureException(e)
      throw e
    }
  }

  public async logout(dids: string[] = []) {
    if (!this.selectedAccount) {
      return
    }

    let selectedDids = dids
    if (dids.length === 0) {
      selectedDids = Object.keys(this.accounts)
    }
    try {
      await SecureStore.deleteItemAsync(CONFIG.WALLETS_STORAGE_KEY)
      await SecureStore.deleteItemAsync(CONFIG.SELECTED_WALLET_STORAGE_KEY)
      await store.dispatch(removeUserWallets())
      DataConnectorsManager.emit('logout', null)
      selectedDids.forEach((did) => {
        delete this.accounts[did]
      })

      if (isEmpty(this.selectedAccount)) {
        await SecureStore.deleteItemAsync(CONFIG.ACCOUNTS_STORAGE_KEY)
      } else {
        await SecureStore.setItemAsync(
          CONFIG.ACCOUNTS_STORAGE_KEY,
          JSON.stringify(this.accounts)
        )
      }

      if (selectedDids.includes(this.selectedAccount.did)) {
        this.selectedAccount = undefined
        this.context = undefined
        this.client = undefined
        this.vault = undefined
        await SecureStore.deleteItemAsync(
          CONFIG.SELECTED_ACCOUNT_DID_STORAGE_KEY
        )
        store.dispatch(setSelectedAccount(null))
      }
      store.dispatch(setAccounts(this.accounts))

      // Switch to next account if the current account logged out
      if (!this.selectedAccount && Object.values(this.accounts).length > 0) {
        const nextAccount = Object.values(this.accounts)[0]
        await this.switchToAccount(nextAccount.did)
      }
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public async switchToAccount(did: string, connect = true) {
    try {
      this.selectedAccount = this.accounts[did]
      const { backedup } = this.selectedAccount.seedPhraseReminder
      if (!backedup) {
        this.selectedAccount.seedPhraseReminder.lastTime = Date.now()
      }
      await SecureStore.setItemAsync(
        CONFIG.SELECTED_ACCOUNT_DID_STORAGE_KEY,
        this.selectedAccount.did
      )

      if (connect) {
        await this.connect(true)
      }
      await this.restoreUserWallet(true)
      DataConnectorsManager.emit('logout', null)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const name = await this.vault?.profiles.public.get('name')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const avatar = await this.vault?.profiles.public.get('avatar')

      store.dispatch(setSelectedAccount(this.selectedAccount))
      setTimeout(() => {
        store.dispatch(
          setSwitchAccountToast({
            name,
            avatar,
          })
        )

        setTimeout(() => {
          store.dispatch(setSwitchAccountToast(null))
        }, 5000)
      }, 100)
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  private async updateCurrentAccount(data: Partial<Account>) {
    const nextSelectedAccount: Account = this.selectedAccount || {
      mnemonic: '',
      did: '', // DID will be filled after connecting to Verida
      privateKey: '',
      seedPhraseReminder: {
        lastTime: undefined,
        backedup: false,
      },
    }

    this.selectedAccount = { ...nextSelectedAccount, ...data }

    this.accounts[this.selectedAccount.did] = this.selectedAccount

    await SecureStore.setItemAsync(
      CONFIG.ACCOUNTS_STORAGE_KEY,
      JSON.stringify(this.accounts)
    )

    await SecureStore.setItemAsync(
      CONFIG.SELECTED_ACCOUNT_DID_STORAGE_KEY,
      this.selectedAccount.did
    )
  }

  private findIfMnemonicExists(mnemonic: string) {
    return Object.values(this.accounts).some(
      (account) => account.mnemonic === mnemonic
    )
  }

  public async importAccount(mnemonic: string) {
    try {
      if (this.findIfMnemonicExists(mnemonic)) {
        return null
      }
      const veridaWallet = WalletUtils.utils.getWallet('ethr', mnemonic)

      this.selectedAccount = {
        mnemonic,
        privateKey: veridaWallet.privateKey,
        did: '', // DID will be filled after connecting to Verida
        seedPhraseReminder: {
          lastTime: undefined,
          backedup: false,
        },
      }
      DataConnectorsManager.emit('logout', null)
      await this.connect(true)
      store.dispatch(setSelectedAccount(this.selectedAccount))
      store.dispatch(addAccount(this.selectedAccount))

      return this.selectedAccount
    } catch (e) {
      if (this.selectedAccount) await this.logout([this.selectedAccount.did])
      Sentry.captureException(e)
      throw e
    }
  }

  public async updateLastTimeSeedPhraseReminder(backedup: boolean) {
    await this.updateCurrentAccount({
      seedPhraseReminder: {
        backedup,
        lastTime: Date.now(),
      },
    })
  }

  public async checkIfVeridaTeamMember() {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const name = await this.vault?.profiles.public.get('name')
      return name?.includes('_vda') ?? false
    } catch (e) {
      return false
    }
  }
}

export default AccountManager

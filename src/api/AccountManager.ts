import { AutoAccount } from '@verida/account-node'
import { Client } from '@verida/client-rn'
import { BlockchainAnchor, IContext, Network } from '@verida/types'
import EventEmitter from 'events'
import { isEmpty, merge } from 'lodash'

import { config } from '~/config'
import { VERIDA_VAULT_CONTEXT_NAME } from '~/constants/application'
import {
  ACCOUNTS_STORAGE_KEY,
  SELECTED_ACCOUNT_DID_STORAGE_KEY,
} from '~/constants/storageKeys'
import {
  clearCryptoWallets,
  createCryptoWallet,
  restoreCryptoWallets,
} from '~/features/cryptoWallet'
import {
  Account,
  addAccount,
  CreateIdentityStep,
  CreateIdentityStepStatus,
  generateIdentityMnemonic,
  getNetworkFromDID,
  getPrivateKeyFromMnemonic,
  NormalizedAccounts,
  setAccounts,
  setSelectedAccount,
} from '~/features/identities'
import { fetchAllPublicProfilesData, PublicProfile } from '~/features/profiles'
import {
  CONFIG_DB_NAME,
  SEED_PHRASE_BACKED_UP_CONFIG,
} from '~/features/settings'
import { Logger } from '~/features/telemetry'
import { getDidClientConfigForNetwork } from '~/features/verida'
import { getCountryCode } from '~/helpers/countries'
import * as SecureStore from '~/helpers/VeridaSecureStore'
import { store } from '~/reduxStore'
import { executeWithTimeout } from '~/utils'

import DataConnectorsManager from './DataConnectorsManager'
import Vault from './VaultCommon/vault'

const logger = Logger.create('AccountManager')

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
      await SecureStore.deleteItemAsync(ACCOUNTS_STORAGE_KEY)
      await SecureStore.deleteItemAsync(SELECTED_ACCOUNT_DID_STORAGE_KEY)

      AccountManager.getInstance().emit('ForcedDeleteAccounts', null)
    }
  }

  public async init() {
    try {
      if (!this.selectedAccount) {
        const [storedAccounts, storedSelectedAccountDid] = await Promise.all([
          SecureStore.getItemAsync(ACCOUNTS_STORAGE_KEY),
          SecureStore.getItemAsync(SELECTED_ACCOUNT_DID_STORAGE_KEY),
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
      }
    } catch (error) {
      logger.error(error)
    }
  }

  public getSelectedAccount() {
    return this.selectedAccount
  }

  public getSelectedAccountNetwork() {
    return this.selectedAccount?.did
      ? getNetworkFromDID(this.selectedAccount.did)
      : undefined
  }

  public async connect(forced: boolean, network: Network) {
    if (!forced && this.context) {
      return
    }
    this.context = await this.getVeridaContext(network)
    this.vault = await this.getVault()
    store.dispatch(restoreCryptoWallets())
  }

  public static getInstance(): AccountManager {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager()
    }

    return AccountManager.instance
  }

  public async getVeridaContext(
    veridaNetwork: Network
  ): Promise<IContext | undefined> {
    try {
      if (!this.selectedAccount) return undefined

      let network = veridaNetwork

      const selectAccountDid = this.selectedAccount.did
      if (selectAccountDid) {
        network = getNetworkFromDID(selectAccountDid)
      }

      const didClientConfig = getDidClientConfigForNetwork(network)

      this.client = new Client({
        network,
        didClientConfig: {
          rpcUrl: didClientConfig.rpcUrl,
          blockchain: BlockchainAnchor.POLPOS, // TODO: migration check
        },
      })

      const { mnemonic } = this.selectedAccount

      const account = new AutoAccount({
        privateKey: mnemonic,
        network,
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
        VERIDA_VAULT_CONTEXT_NAME,
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
        logger.info(`Endpoint is currently unavailable`, { endpointUri })
      })

      // @todo: Do something useful with these messages
      // @ts-expect-error This event emitter interface is not documented.
      context!.on('EndpointWarning', (endpointUri: string, message: string) => {
        logger.info(`Warning from endpoint`, { endpointUri, message })
      })

      return context
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  public getClient() {
    return this.client
  }

  private async getVault() {
    try {
      const vault = new Vault(this.client, this.context)
      await vault.init()
      return vault
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  private async setPublicProfile(data: PublicProfile) {
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
      const configDb = await this.context?.openDatabase(CONFIG_DB_NAME)
      await configDb?.save(
        { _id: SEED_PHRASE_BACKED_UP_CONFIG, value: backedup },
        {}
      )
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  public async getBackedupSeedPhraseConfig() {
    try {
      const configDb = await this.context?.openDatabase(CONFIG_DB_NAME)
      return await configDb?.get(SEED_PHRASE_BACKED_UP_CONFIG, {})
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  public async createAccount(
    userData: PublicProfile,
    country: string,
    network: Network,
    updateProgress?: (
      step: CreateIdentityStep,
      status: CreateIdentityStepStatus
    ) => void
  ): Promise<Account | undefined> {
    console.log('Create account -------')

    let connected = false
    updateProgress?.('StorageLocation', 'idle')
    updateProgress?.('CreateProfile', 'idle')
    updateProgress?.('ClaimUsername', 'idle')

    try {
      updateProgress?.('CreateIdentifier', 'processing')

      const { mnemonic, privateKey } = generateIdentityMnemonic()

      this.selectedAccount = {
        mnemonic,
        privateKey,
        did: '', // DID will be filled after connecting to Verida
        seedPhraseReminder: {
          lastTime: undefined,
          backedup: false,
        },
      }
    } catch (error) {
      logger.error(
        new Error('Failed to create a mnemonic for new account', {
          cause: error,
        })
      )
      updateProgress?.('CreateIdentifier', 'error')
      throw error
    }

    try {
      const defaultDidConfig = getDidClientConfigForNetwork(network)
      const didClientConfig = merge({}, defaultDidConfig, {
        veridaKey: this.selectedAccount!.privateKey,
      })

      console.log('Create account 0', didClientConfig)

      this.client = new Client({
        network,
        didClientConfig: {
          rpcUrl: didClientConfig.rpcUrl,
          blockchain: BlockchainAnchor.POLPOS, // TODO: migration check
        },
      })

      console.log('Create account 1')
      const account = new AutoAccount({
        privateKey: this.selectedAccount!.mnemonic,
        network,
        didClientConfig,
      })

      console.log('Create account 2', account)
      // Load suitable node based on selected country
      const countryCode = getCountryCode(country)

      console.log('Create account 3', countryCode)
      const notificationEndpoints =
        config.verida[network].notificationServerUrls

      await account.loadDefaultStorageNodes(countryCode, 3, {
        network,
        notificationEndpoints,
      })

      console.log('Create account 4')

      updateProgress?.('StorageLocation', 'processing')
      // Connect the Verida account to the Verida client
      await this.client.connect(account)

      console.log('Create account 5')

      // Open the Vault context, forcing its creation
      const context = await this.client.openContext(
        VERIDA_VAULT_CONTEXT_NAME,
        true
      )

      console.log('Create account 6')

      if (context === undefined) {
        throw new Error(`Failed to open context ${VERIDA_VAULT_CONTEXT_NAME}`)
      }
      this.context = context

      console.log('Create account 7')

      // Set the Vault
      this.vault = await this.getVault()

      // Fill the connected account with Verida DID
      if (isEmpty(this.selectedAccount!.did)) {
        const did = await account.did()
        await this.updateCurrentAccount({ did })
      }

      connected = true
    } catch (error) {
      logger.error(new Error('Failed to create new account', { cause: error }))
      updateProgress?.('CreateIdentifier', 'error')
      updateProgress?.('StorageLocation', 'error')
      throw error
    }

    updateProgress?.('CreateIdentifier', 'success')
    updateProgress?.('StorageLocation', 'success')

    try {
      updateProgress?.('CreateProfile', 'processing')

      const setPublicProfileSuccess = await executeWithTimeout(
        this.setPublicProfile(userData),
        100000
      )

      if (!setPublicProfileSuccess) {
        throw new Error('Failed to set public profile')
      }

      store.dispatch(setSelectedAccount(this.selectedAccount))
      store.dispatch(addAccount(this.selectedAccount))
      store.dispatch(fetchAllPublicProfilesData())

      // At this point can consider DID and Profile are created successfully
      // so we just finish this function and do these heavy tasks below asynchronously
      store.dispatch(createCryptoWallet({}))
      this.setBackedupSeedPhraseConfig(false)

      updateProgress?.('CreateProfile', 'success')
    } catch (error) {
      logger.error(
        new Error('Failed to set profile on new account', { cause: error })
      )
      updateProgress?.('CreateProfile', 'error')

      // If the corrupted account is already connected, we need to remove it
      if (connected && this.selectedAccount) {
        await this.logout([this.selectedAccount.did])
      }

      throw error
    }

    return this.selectedAccount
  }

  public async logout(dids: string[] = [], nextDidToSwitchTo?: string) {
    if (!this.selectedAccount) {
      return
    }

    let selectedDids = dids
    if (dids.length === 0) {
      selectedDids = Object.keys(this.accounts)
    }
    try {
      store.dispatch(clearCryptoWallets())
      DataConnectorsManager.emit('logout', null)
      selectedDids.forEach((did) => {
        delete this.accounts[did]
      })

      if (isEmpty(this.selectedAccount)) {
        await SecureStore.deleteItemAsync(ACCOUNTS_STORAGE_KEY)
      } else {
        await SecureStore.setItemAsync(
          ACCOUNTS_STORAGE_KEY,
          JSON.stringify(this.accounts)
        )
      }

      if (selectedDids.includes(this.selectedAccount.did)) {
        this.selectedAccount = undefined
        this.context = undefined
        this.client = undefined
        this.vault = undefined
        await SecureStore.deleteItemAsync(SELECTED_ACCOUNT_DID_STORAGE_KEY)
        store.dispatch(setSelectedAccount(undefined))
      }
      store.dispatch(setAccounts(this.accounts))
      store.dispatch(fetchAllPublicProfilesData())

      // Switch to next account if the current account logged out
      if (!this.selectedAccount && Object.values(this.accounts).length > 0) {
        const nextDidExist = Object.values(this.accounts).some(
          (account) => account.did === nextDidToSwitchTo
        )
        const nextAccountDid = nextDidExist
          ? nextDidToSwitchTo
          : Object.values(this.accounts)[0].did
        await this.switchToAccount(nextAccountDid!)
      }
    } catch (error) {
      logger.error(error)
      throw error
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
        SELECTED_ACCOUNT_DID_STORAGE_KEY,
        this.selectedAccount.did
      )

      if (connect) {
        const network = getNetworkFromDID(did)
        await this.connect(true, network)
      }
      DataConnectorsManager.emit('logout', null)

      store.dispatch(setSelectedAccount(this.selectedAccount))

      // FIXME: refactor this function, remove nested timers
      // Comment as it doesn't work now
      // async function showSwitchNewAccountToast() {
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //   const name = await this.vault?.profiles.public.get('name')
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //   const avatar = await this.vault?.profiles.public.get('avatar')
      //   console.log('====>>>>>>>>>>>>>>> Name', name)

      //   store.dispatch(setSwitchAccountToast({ name, avatar }))

      //   setTimeout(() => {
      //     store.dispatch(setSwitchAccountToast(undefined))
      //   }, 5000)
      // }

      // // Show the toast asynchronously
      // showSwitchNewAccountToast()
    } catch (error) {
      logger.error(error)

      throw error
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

    // That doesn't make sense to be here
    this.addAccount(this.selectedAccount)

    // That doesn't make sense to be here
    await SecureStore.setItemAsync(
      SELECTED_ACCOUNT_DID_STORAGE_KEY,
      this.selectedAccount.did
    )
  }

  public async addAccount(account: Account) {
    if (!account?.did) {
      return // TODO: Throw error?
    }

    this.accounts[account.did] = account

    await SecureStore.setItemAsync(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify(this.accounts)
    )
  }

  private findIfMnemonicExists(mnemonic: string) {
    return Object.values(this.accounts).some(
      (account) => account.mnemonic === mnemonic
    )
  }

  public async importAccount(mnemonic: string, network: Network) {
    try {
      if (this.findIfMnemonicExists(mnemonic)) {
        return null
      }
      const privateKey = getPrivateKeyFromMnemonic(mnemonic)

      this.selectedAccount = {
        mnemonic,
        privateKey,
        did: '', // DID will be filled after connecting to Verida
        seedPhraseReminder: {
          lastTime: undefined,
          backedup: false,
        },
      }
      DataConnectorsManager.emit('logout', null)
      await this.connect(true, network)
      store.dispatch(setSelectedAccount(this.selectedAccount))
      store.dispatch(addAccount(this.selectedAccount))
      store.dispatch(fetchAllPublicProfilesData())

      return this.selectedAccount
    } catch (error) {
      if (this.selectedAccount) await this.logout([this.selectedAccount.did])
      logger.error(error)
      throw error
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
}

export default AccountManager

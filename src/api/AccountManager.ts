// eslint-disable-next-line simple-import-sort/imports
import * as Sentry from '@sentry/react-native'
import { Client, Context } from '@verida/client-rn'
import { AutoAccount } from '@verida/account-node'
import Vault from '@verida/vault-common'
import { ethers, utils } from 'ethers'
import * as SecureStore from 'helpers/VeridaSecureStore'
import { isEmpty, merge } from 'lodash'
import { store } from 'reduxStore'

import {
  Account,
  AddIdentityStepStatus,
  AddIdentityStepType,
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
import { getTokens } from 'reduxStore/tokens/actions'
import { getCountryCode } from 'utils/profile'
import { execWithTimeout } from 'api/utils'
import { selectChains } from 'reduxStore/tokens/selectors'
import DataConnectorsManager from './DataConnectorsManager'
import multiChainWallet from 'wallet/helpers/multiChainWallet'
import { rawDataToReduxState } from 'wallet/helpers/tokens'

import NodeSelector from './NodeSelector'

import CONFIG from '../config/environment'
import EventEmitter from 'events'

type EndpointUrls = {
  dbServerUrl: string[]
  messageServerUrl: string[]
  notificationServerUrl: string[]
}

class AccountManager extends EventEmitter {
  // public selectedChain: string = DEFAULT_CHAIN
  public context: Context | undefined
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
      const chains = selectChains(store.getState())
      await store.dispatch(getTokens())
      const newChains = selectChains(store.getState())
      const updateWallets =
        JSON.stringify(chains) !== JSON.stringify(newChains) ? true : false
      if (!this.selectedAccount) {
        const accountsRaw = await SecureStore.getItemAsync(
          CONFIG.ACCOUNTS_STORAGE_KEY
        )
        //accountsRaw = undefined
        //store.dispatch(setAccounts([]))
        if (accountsRaw) {
          this.accounts = JSON.parse(accountsRaw)
          // Sometimes if the app crashes when creating an account, it creates one that is empty
          // In that case, remove it so the app doesn't return to the create account screen
          // causing loss of access to all other accounts
          if (this.accounts['']) {
            delete this.accounts['']
          }
          await this.filterDids()
          store.dispatch(setAccounts(this.accounts))
        }

        let selectedAccountDid = await SecureStore.getItemAsync(
          CONFIG.SELECTED_ACCOUNT_DID_STORAGE_KEY
        )

        // If no selected DID, choose the first
        if (!selectedAccountDid && Object.keys(this.accounts).length) {
          selectedAccountDid = this.accounts[Object.keys(this.accounts)[0]].did
        }

        if (!isEmpty(this.accounts) && selectedAccountDid) {
          this.selectedAccount = this.accounts[selectedAccountDid]
          store.dispatch(setSelectedAccount(this.selectedAccount))
        }

        const walletsRaw = await SecureStore.getItemAsync(
          CONFIG.WALLETS_STORAGE_KEY
        )
        // if there's no seed phrase in wallet data (and near address doesnt exist), create wallets again using seedphrase in verida store
        if (!walletsRaw || updateWallets) {
          const selectedAccount = this.getSelectedAccount()
          if (selectedAccount) {
            await this.connect()
          }

          await this.restoreUserWallet()
        } else {
          const wallets = JSON.parse(walletsRaw)
          store.dispatch(saveUserWallets(wallets))
          const selectedWalletID = await SecureStore.getItemAsync(
            CONFIG.SELECTED_WALLET_STORAGE_KEY
          )
          await store.dispatch(setSelectedWallet(selectedWalletID))
        }
      }
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  public getSelectedAccount() {
    return this.selectedAccount
  }

  public async connect(forced = false, endpointUrls?: EndpointUrls) {
    if (!forced && this.context) {
      return
    }
    this.context = await this.getVeridaContext(endpointUrls)
    this.vault = await this.getVault()
  }

  public static getInstance(): AccountManager {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager()
    }

    return AccountManager.instance
  }

  public async getVeridaContext(
    endpointUrls?: EndpointUrls
  ): Promise<Context | undefined> {
    try {
      if (!this.selectedAccount) {
        return undefined
      }

      this.client = new Client({
        environment: CONFIG.VERIDA_ENVIRONMENT,
        didClientConfig: {
          rpcUrl: CONFIG.VERIDA_DID_CLIENT_CONFIG.rpcUrl,
        },
      })

      const { mnemonic } = this.selectedAccount

      // Use empty endpointUri's as they should already have been specified
      // when the account was created
      const didClientConfig = merge({}, CONFIG.VERIDA_DID_CLIENT_CONFIG)
      didClientConfig.didEndpoints = []

      const account = new AutoAccount(
        {
          defaultDatabaseServer: {
            type: 'VeridaDatabase',
            endpointUri: [],
          },
          defaultMessageServer: {
            type: 'VeridaMessage',
            endpointUri: [],
          },
          defaultNotificationServer: {
            type: 'VeridaNotification',
            endpointUri: [],
          },
        },
        {
          privateKey: mnemonic,
          environment: CONFIG.VERIDA_ENVIRONMENT,
          didClientConfig,
        }
      )

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

      // @todo: use account.setAccountConfig()
      account.setAccountConfig({
        defaultDatabaseServer: contextConfig.services.databaseServer,
        defaultMessageServer: contextConfig.services.messageServer,
      })

      // @todo: Do something useful with these messages
      context!.on('EndpointUnavailable', (endpointUri: string) => {
        // eslint-disable-next-line no-console
        console.info(`Endpoint is currently unavailable: ${endpointUri}`)
      })

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
      const userHDWalletMnemonic = multiChainWallet.generateMnemonic()

      // save mnemonic to verida store
      const walletDb = await this.context?.openDatastore(
        'https://vault.schemas.verida.io/wallets/v0.2.0/schema.json'
      )
      const wallet = {
        mnemonic: userHDWalletMnemonic,
        walletType: 'multi',
        label: 'Multi Coin Wallet',
      }
      const saved: any = await walletDb?.save(wallet)
      const walletID = saved?.id

      // generate wallets and save em to redux state

      const chains = selectChains(store.getState())

      const userGeneratedWallets = multiChainWallet.generateWalletsForChains({
        privateKey: null,
        mnemonic: userHDWalletMnemonic,
        chains,
        chain: null,
      })

      const walletData = {
        [walletID]: {
          seedPhrase: wallet.mnemonic,
          privateKey: null,
          type: wallet.walletType,
          label: wallet.label,
          id: walletID,
          accounts: userGeneratedWallets,
          chain: null,
        },
      }

      await store.dispatch(saveUserWallets(walletData))

      await store.dispatch(setSelectedWallet(walletID))

      // save to storage..
      await SecureStore.setItemAsync(
        CONFIG.WALLETS_STORAGE_KEY,
        JSON.stringify(walletData)
      )
      await SecureStore.setItemAsync(
        CONFIG.SELECTED_WALLET_STORAGE_KEY,
        walletID
      )
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public async restoreUserWallet() {
    try {
      await store.dispatch(removeUserWallets())
      const datastore = await this.context?.openDatastore(
        'https://vault.schemas.verida.io/wallets/v0.2.0/schema.json'
      )

      const hdWallets: any = await datastore?.getMany()
      const chains = selectChains(store.getState())

      if (!isEmpty(hdWallets)) {
        const wallets: any = rawDataToReduxState(hdWallets, chains)

        await store.dispatch(saveUserWallets(wallets))

        // save to storage..
        await SecureStore.setItemAsync(
          CONFIG.WALLETS_STORAGE_KEY,
          JSON.stringify(wallets)
        )

        if (hdWallets[0]) {
          const selectedWalletID = hdWallets[0]._id

          await store.dispatch(setSelectedWallet(selectedWalletID))

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

      // Find suitable node based on selected country
      const countryCode = getCountryCode(country)
      const endpoints = await NodeSelector.selectEndpointUris(countryCode)

      // Endpoints to be used in account config
      const endpointUris = {
        dbServerUrl: endpoints,
        messageServerUrl: endpoints,
        notificationServerUrl: NodeSelector.notificationEndpoints(),
      }

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

      const didEndpointUris: string[] = endpointUris.dbServerUrl.reduce(
        (result: string[], item: string) => {
          result.push(`${item}did/`)
          return result
        },
        []
      )

      const didClientConfig = merge({}, CONFIG.VERIDA_DID_CLIENT_CONFIG, {
        veridaKey: this.selectedAccount.privateKey,
      })
      didClientConfig.didEndpoints = didEndpointUris

      const { mnemonic } = this.selectedAccount

      this.client = new Client({
        environment: CONFIG.VERIDA_ENVIRONMENT,
        didClientConfig: {
          rpcUrl: CONFIG.VERIDA_DID_CLIENT_CONFIG.rpcUrl,
        },
      })

      const account = new AutoAccount(
        {
          defaultDatabaseServer: {
            type: 'VeridaDatabase',
            endpointUri: endpointUris.dbServerUrl,
          },
          defaultMessageServer: {
            type: 'VeridaMessage',
            endpointUri: endpointUris.messageServerUrl,
          },
          defaultNotificationServer: {
            type: 'VeridaNotification',
            endpointUri: endpointUris.notificationServerUrl,
          },
        },
        {
          privateKey: mnemonic,
          environment: CONFIG.VERIDA_ENVIRONMENT,
          didClientConfig,
        }
      )

      // Connect the Verida account to the Verida client
      await this.client.connect(account)

      // Open the Vault context, forcing its creation
      this.context = await this.client.openContext(
        CONFIG.VERIDA_CONTEXT_NAME,
        true
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

      updateProgress?.('CreateProfile', 'Success')

      // At this point can consider DID and Profile are created successfully
      // so we just finish this function and do these heavy tasks below asynchronously
      setTimeout(async () => {
        await this.setBackedupSeedPhraseConfig(false)
        await this.setUserWallet()
      }, 0)

      return this.selectedAccount
    } catch (e) {
      updateProgress?.('CreateProfile', 'Failure')
      // If the corrupted account is already connected, we need to remove it
      if (connected && this.selectedAccount) {
        await this.logout([this.selectedAccount?.did])
      }
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
      await this.restoreUserWallet()
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
    if (!this.selectedAccount) {
      this.selectedAccount = {
        mnemonic: '',
        did: '', // DID will be filled after connecting to Verida
        seedPhraseReminder: {
          lastTime: undefined,
          backedup: false,
        },
      }
    }

    this.selectedAccount = {
      ...(this.selectedAccount || {}),
      ...data,
    }
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
      this.selectedAccount = {
        mnemonic,
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

      await this.restoreUserWallet()
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

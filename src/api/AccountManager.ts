// eslint-disable-next-line simple-import-sort/imports
import * as Sentry from '@sentry/react-native'
import { Client, Context, EnvironmentType } from '@verida/client-rn'
import { AutoAccount } from '@verida/account-node'
import Vault from '@verida/vault-common'
import WalletUtils from '@verida/wallet-utils'
import { utils } from 'ethers'
import * as SecureStore from 'expo-secure-store'
import { isEmpty, times } from 'lodash'
import store from 'reduxStore'

import { Account, NetworkNode, NormalizedAccounts, UserData } from 'api/types'
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
import {
  getCountryCode,
  getDefaultNode,
  getNodeCodeFromCountry,
} from 'utils/profile'
import { fetchNetworks } from 'api/utils'

type EndpointUrls = {
  dbServerUrl: string
  messageServerUrl: string
  notificationServerUrl: string
}

const ACCOUNTS_STORAGE_KEY = 'accounts'
const SELECTED_ACCOUNT_DID_STORAGE_KEY = 'selected-account-did'
export const WALLETS_STORAGE_KEY = 'wallets'
export const SELECTED_WALLET_STORAGE_KEY = 'selected-wallet'
export const VERIDA_CONTEXT_NAME = 'Verida: Vault'
export const MNEMONIC_LENGTH = 12
const VERIDA_ENVIRONMENT = EnvironmentType.TESTNET
const CONFIG_DB = 'vault-config'
const SEED_PHRASE_BACKED_UP_CONFIG = 'seedPhraseBackedUp'

class AccountManager {
  // public selectedChain: string = DEFAULT_CHAIN
  public context: Context | undefined
  public client: Client | undefined
  public vault: Vault | undefined
  public accounts: NormalizedAccounts
  private selectedAccount: Account | undefined

  private static instance: AccountManager

  private constructor() {
    this.accounts = {}
  }

  private async filterDids() {
    let hasInvalidData = false
    Object.keys(this.accounts).map((did) => {
      if (did.includes('did:3')) {
        hasInvalidData = true
      }
    })

    if (hasInvalidData) {
      this.accounts = {}
      await SecureStore.deleteItemAsync(ACCOUNTS_STORAGE_KEY)
      await SecureStore.deleteItemAsync(SELECTED_ACCOUNT_DID_STORAGE_KEY)
    }
  }

  public async init() {
    try {
      if (!this.selectedAccount) {
        const accountsRaw = await SecureStore.getItemAsync(ACCOUNTS_STORAGE_KEY)
        if (accountsRaw) {
          this.accounts = JSON.parse(accountsRaw)
          await this.filterDids()
          store.dispatch(setAccounts(this.accounts))
        }
        const selectedAccountDid = await SecureStore.getItemAsync(
          SELECTED_ACCOUNT_DID_STORAGE_KEY
        )

        if (!isEmpty(this.accounts) && selectedAccountDid) {
          this.selectedAccount = this.accounts[selectedAccountDid]
          store.dispatch(setSelectedAccount(this.selectedAccount))
        }

        const walletsRaw = await SecureStore.getItemAsync(WALLETS_STORAGE_KEY)
        // if there's no seed phrase in wallet data (and near address doesnt exist), create wallets again using seedphrase in verida store
        if (walletsRaw) {
          const wallets = JSON.parse(walletsRaw)
          if (wallets.seedPhrase || wallets.near) {
            const selectedAccount = this.getSelectedAccount()
            if (selectedAccount) {
              await this.connect()
            }

            await this.restoreUserWallet()
          } else {
            store.dispatch(saveUserWallets(wallets))
            const selectedWalletID = await SecureStore.getItemAsync(
              SELECTED_WALLET_STORAGE_KEY
            )
            await store.dispatch(setSelectedWallet(selectedWalletID))
          }
        } else {
          // else basically old account.. create a seedphrase and set wallet.
          await this.setUserWallet()
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

      let selectedEndpointUrls: EndpointUrls | undefined = endpointUrls
      if (!selectedEndpointUrls) {
        const networks = await fetchNetworks()
        if (isEmpty(networks)) {
          throw 'Networks configuration not available'
        }

        const defaultNode = getDefaultNode(networks)
        if (!defaultNode) {
          throw 'No default node available'
        }

        selectedEndpointUrls = {
          dbServerUrl: defaultNode.db_address,
          messageServerUrl: defaultNode.messaging_address,
          notificationServerUrl: defaultNode.notification_address,
        }
      }

      const { mnemonic } = this.selectedAccount
      this.client = new Client({
        environment: VERIDA_ENVIRONMENT,
      })

      // Endpoint uris only get passed when creating account.
      // When an account is reconnected, endpoint uris are selected based on DID documents of that account.
      const account = new AutoAccount(
        {
          defaultDatabaseServer: {
            type: 'VeridaDatabase',
            endpointUri: selectedEndpointUrls.dbServerUrl,
          },
          defaultMessageServer: {
            type: 'VeridaMessage',
            endpointUri: selectedEndpointUrls.messageServerUrl,
          },
          defaultNotificationServer: {
            type: 'VeridaNotification',
            endpointUri: selectedEndpointUrls.notificationServerUrl,
          },
        },
        {
          privateKey: mnemonic,
          environment: VERIDA_ENVIRONMENT,
        }
      )

      // Fill the connected account with Verida DID
      if (isEmpty(this.selectedAccount.did)) {
        const did = await account.did()
        await this.updateCurrentAccount({ did })
      }

      // Connect the Verida account to the Verida client
      await this.client.connect(account)

      // Open an application context (forcing creation of a new context if it doesn't already exist)
      return await this.client.openContext(VERIDA_CONTEXT_NAME, true)
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
  }

  public async setBackedupSeedPhraseConfig(backedup: boolean) {
    try {
      const configDb = await this.context?.openDatabase(CONFIG_DB)
      await configDb?.save(
        { _id: SEED_PHRASE_BACKED_UP_CONFIG, value: backedup },
        {}
      )
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public async getBackedupSeedPhraseConfig() {
    try {
      const configDb = await this.context?.openDatabase(CONFIG_DB)
      return await configDb?.get(SEED_PHRASE_BACKED_UP_CONFIG, {})
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public async setUserWallet() {
    try {
      await store.dispatch(removeUserWallets())
      const userHDWalletMnemonic =
        WalletUtils.MultiChainWallet.generateMnemonic()

      // save mnemonic to verida store
      const walletDb = await this.context?.openDatastore(
        'https://vault.schemas.verida.io/wallets/v0.1.0/schema.json'
      )
      const wallet = {
        mnemonic: userHDWalletMnemonic,
        walletType: 'multi',
        label: 'Multi Coin Wallet',
      }
      const saved: any = await walletDb?.save(wallet)
      const walletID = saved?.id

      // generate wallets and save em to redux state
      const userGeneratedWallets =
        WalletUtils.MultiChainWallet.generateHDWallets(userHDWalletMnemonic)

      const walletData = {
        [walletID]: {
          seedPhrase: wallet.mnemonic,
          type: wallet.walletType,
          label: wallet.label,
          id: walletID,
          accounts: userGeneratedWallets,
        },
      }

      await store.dispatch(saveUserWallets(walletData))

      await store.dispatch(setSelectedWallet(walletID))

      // save to storage..
      await SecureStore.setItemAsync(
        WALLETS_STORAGE_KEY,
        JSON.stringify(walletData)
      )
      await SecureStore.setItemAsync(SELECTED_WALLET_STORAGE_KEY, walletID)
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }

  public async restoreUserWallet() {
    try {
      await store.dispatch(removeUserWallets())
      const datastore = await this.context?.openDatastore(
        'https://vault.schemas.verida.io/wallets/v0.1.0/schema.json'
      )

      const hdWallets: any = await datastore?.getMany()

      const wallets: any = {}
      if (!isEmpty(hdWallets)) {
        hdWallets.forEach((walt: any) => {
          const mnemonic = walt.mnemonic
          const walletID = walt._id
          const accounts =
            WalletUtils.MultiChainWallet.generateHDWallets(mnemonic)

          wallets[walletID] = {
            seedPhrase: mnemonic,
            type: walt.walletType,
            label: walt.label,
            id: walletID,
            accounts,
          }
        })

        await store.dispatch(saveUserWallets(wallets))

        // save to storage..
        await SecureStore.setItemAsync(
          WALLETS_STORAGE_KEY,
          JSON.stringify(wallets)
        )

        if (hdWallets[0]) {
          const selectedWalletID = hdWallets[0]._id

          await store.dispatch(setSelectedWallet(selectedWalletID))

          await SecureStore.setItemAsync(
            SELECTED_WALLET_STORAGE_KEY,
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
    country: string
  ): Promise<Account | undefined> {
    try {
      // Find suitable node based on selected country
      const countryCode = getCountryCode(country)
      const networks = store.getState().networks
      const countries = store.getState().countries
      if (!countryCode || isEmpty(networks)) {
        throw new Error('Invalid network or country configuration')
      }
      const matchedNodeCode = getNodeCodeFromCountry(countryCode, countries)
      let selectedNode
      if (!matchedNodeCode) {
        // If there is no matched node for the selected country, use the default one in configuration file.
        selectedNode = getDefaultNode(networks)
        if (!selectedNode) {
          throw new Error('No default node available')
        }
      } else {
        selectedNode = networks[0].nodes.find(
          (node: NetworkNode) => node.node_code === matchedNodeCode
        )
        if (!selectedNode) {
          throw new Error('Cannot find selected network node configuration')
        }
      }

      // Endpoints to be used in account config
      const endpointUris = {
        dbServerUrl: selectedNode.db_address,
        messageServerUrl: selectedNode.messaging_address,
        notificationServerUrl: selectedNode.notification_address,
      }
      const node = utils.HDNode.entropyToMnemonic(utils.randomBytes(16))

      this.selectedAccount = {
        mnemonic: node,
        did: '', // DID will be filled after connecting to Verida
        seedPhraseReminder: {
          lastTime: undefined,
          backedup: false,
        },
      }

      await this.connect(true, endpointUris)
      await this.setPublicProfile(userData)
      await this.setBackedupSeedPhraseConfig(false)
      await this.setUserWallet()

      store.dispatch(setSelectedAccount(this.selectedAccount))
      store.dispatch(addAccount(this.selectedAccount))

      return this.selectedAccount
    } catch (e) {
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
      await SecureStore.deleteItemAsync(WALLETS_STORAGE_KEY)
      await SecureStore.deleteItemAsync(SELECTED_WALLET_STORAGE_KEY)
      await store.dispatch(removeUserWallets())

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
        store.dispatch(setSelectedAccount(null))
      }
      store.dispatch(setAccounts(this.accounts))

      // Switch to next account if the current account logged out
      if (!this.selectedAccount && Object.values(this.accounts).length > 0) {
        const nextAccount = Object.values(this.accounts)[0]
        await this.switchToAccount(nextAccount.did)
      }
    } catch (e) {
      console.log('Entered inside error', e)
      Sentry.captureException(e)
      throw e
    }
  }

  public async switchToAccount(did: string) {
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
      await this.connect(true)
      await this.restoreUserWallet()

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
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify(this.accounts)
    )
    await SecureStore.setItemAsync(
      SELECTED_ACCOUNT_DID_STORAGE_KEY,
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
      
      await this.connect(true)
      store.dispatch(setSelectedAccount(this.selectedAccount))
      store.dispatch(addAccount(this.selectedAccount))
      
      await this.restoreUserWallet()
      return this.selectedAccount
    } catch (e) {
      if(this.selectedAccount)
        this.logout([this.selectedAccount.did])
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
      return name.includes('_vda')
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }
}

export default AccountManager

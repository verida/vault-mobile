import * as SecureStore from 'expo-secure-store'
import * as Sentry from '@sentry/react-native'
import { Client, Context } from '@verida/client-rn'
import { AutoAccount } from '@verida/account-node'
import { Wallet } from 'ethers'
import { Utils } from '@verida/3id-utils-node'
import { Account, NormalizedAccounts, UserData } from 'api/types'
import Vault from '@verida/vault-common'
import dataMap from 'config/data-map'
import store from 'reduxStore'
import {
  addAccount,
  setAccounts,
  setSelectedAccount,
  setSwitchAccountToast,
} from 'reduxStore/general/actions'
import { isEmpty } from 'lodash'

const ACCOUNTS_STORAGE_KEY = 'accounts'
const SELECTED_ACCOUNT_DID_STORAGE_KEY = 'selected-account-did'
const CERAMIC_URL = 'https://ceramic.verida.io:7007'
const ENDPOINT_URL = 'https://db.testnet.verida.io:5002/'
export const VERIDA_CONTEXT_NAME = 'Verida: Vault'
export const MNEMONIC_LENGTH = 12

class AccountManager {
  // public selectedChain: string = DEFAULT_CHAIN
  public context: Context | undefined
  public client: Client | undefined
  public vault: Vault | undefined
  public accounts: NormalizedAccounts
  public selectedAccount: Account | undefined

  private static instance: AccountManager

  private constructor() {
    this.accounts = {}
  }

  public async init() {
    try {
      if (!this.selectedAccount) {
        const accountsRaw = await SecureStore.getItemAsync(ACCOUNTS_STORAGE_KEY)
        if (accountsRaw) {
          this.accounts = JSON.parse(accountsRaw)
          store.dispatch(setAccounts(this.accounts))
        }
        const selectedAccountDid = await SecureStore.getItemAsync(
          SELECTED_ACCOUNT_DID_STORAGE_KEY
        )

        if (!isEmpty(this.accounts) && selectedAccountDid) {
          this.selectedAccount = this.accounts[selectedAccountDid]
          store.dispatch(setSelectedAccount(this.selectedAccount))
        }
      }
    } catch (e) {
      console.error(e)
      Sentry.captureException(e)
    }
  }

  public async connect() {
    this.context = undefined
    this.client = undefined
    this.vault = undefined
    this.context = await this.getVeridaContext()
    this.vault = await this.getVault()
  }

  public static getInstance(): AccountManager {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager()
    }

    return AccountManager.instance
  }

  public async getVeridaContext(): Promise<Context | undefined> {
    try {
      if (!this.selectedAccount) {
        return undefined
      }
      const { mnemonic, did } = this.selectedAccount
      const client = new Client({
        ceramicUrl: CERAMIC_URL,
      })
      this.client = client
      const account = new AutoAccount(
        {
          defaultDatabaseServer: {
            type: 'VeridaDatabase',
            endpointUri: ENDPOINT_URL,
          },
          defaultMessageServer: {
            type: 'VeridaMessage',
            endpointUri: ENDPOINT_URL,
          },
          options: { did },
        },
        {
          chain: '3id',
          privateKey: mnemonic,
        }
      )
      await client.connect(account)
      return await client.openContext(VERIDA_CONTEXT_NAME, true)
    } catch (e) {
      Sentry.captureException(e)
      return undefined
    }
  }

  private async getVault() {
    try {
      const vault = new Vault(this.client, this.context, dataMap)
      await vault.init()
      return vault
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  private async setPublicProfile(data: UserData) {
    const entries = Object.entries(data)
    await Promise.all(
      entries.map(async (entry) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.vault?.profiles.public.set(...entry)
      })
    )
  }

  public async createAccount(userData: UserData): Promise<Account | undefined> {
    try {
      const ethWallet = Wallet.createRandom()
      const utils = new Utils(CERAMIC_URL)
      const ceramic = await utils.createAccount('3id', ethWallet.mnemonic)

      this.selectedAccount = {
        mnemonic: ethWallet.mnemonic,
        did: ceramic?.did?.id || '',
        privateKey: ethWallet.privateKey,
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

      await this.connect()

      await this.setPublicProfile(userData)

      store.dispatch(setSelectedAccount(this.selectedAccount))
      store.dispatch(addAccount(this.selectedAccount))

      return this.selectedAccount
    } catch (e) {
      console.error('Create account error:', e)
      Sentry.captureException(e)
      return undefined
    }
  }

  public async logout() {
    try {
      this.selectedAccount = undefined
      this.accounts = {}
      this.context = undefined
      this.client = undefined
      this.vault = undefined
      await SecureStore.deleteItemAsync(SELECTED_ACCOUNT_DID_STORAGE_KEY)
      await SecureStore.deleteItemAsync(ACCOUNTS_STORAGE_KEY)
      store.dispatch(setSelectedAccount(null))
      store.dispatch(setAccounts({}))
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  public async switchToAccount(did: string) {
    try {
      this.selectedAccount = this.accounts[did]
      await SecureStore.setItemAsync(
        SELECTED_ACCOUNT_DID_STORAGE_KEY,
        this.selectedAccount.did
      )
      await this.connect()
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
    }
  }
}

export default AccountManager

import * as SecureStore from 'expo-secure-store'
import * as Sentry from '@sentry/react-native'
import { Client, Context } from '@verida/client-rn'
import { AutoAccount } from '@verida/account-node'
import { Wallet } from 'ethers'
import { Utils } from '@verida/3id-utils-node'
import { Account, UserData } from 'api/types'
import Vault from '@verida/vault-common'
import dataMap from 'config/data-map'

const ACCOUNTS_STORAGE_KEY = 'accounts'
const SELECTED_ACCOUNT_STORAGE_KEY = 'selected-account'
const SELECTED_CHAIN_STORAGE_KEY = 'selected-chain'
const CERAMIC_URL = 'https://ceramic.verida.io:7007'
const ENDPOINT_URL = 'https://db.testnet.verida.io:5002/'
const VERIDA_CONTEXT_NAME = 'Verida: Vault'
const DEFAULT_CHAIN = 'ethr'

class AccountManager {
  public accounts: Account[] = []
  public selectedAccount: Account | undefined
  public selectedChain: string = DEFAULT_CHAIN
  public context: Context | undefined
  public client: Client | undefined
  public vault: Vault | undefined

  private static instance: AccountManager

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public async init() {
    try {
      if (!this.selectedAccount) {
        const accountsRaw = await SecureStore.getItemAsync(ACCOUNTS_STORAGE_KEY)
        if (accountsRaw) {
          this.accounts = JSON.parse(accountsRaw)
        }
        const selectedAccountDid = await SecureStore.getItemAsync(
          SELECTED_ACCOUNT_STORAGE_KEY
        )
        console.log('this.accounts:', this.accounts)
        console.log('selectedAccountDid:', selectedAccountDid)

        if (this.accounts.length > 0 && selectedAccountDid) {
          this.selectedAccount = this.accounts.find(
            (account) => account.did === selectedAccountDid
          )
        }
      }

      // TODO: Support multiple chains
      // if (!this.selectedChain) {
      //   this.selectedChain =
      //     (await SecureStore.getItemAsync(SELECTED_CHAIN_STORAGE_KEY)) ||
      //     DEFAULT_CHAIN
      // }
      console.log('this.selectedAccount', this.selectedAccount)

      if (this.selectedAccount && !this.context) {
        this.context = await this.getVeridaContext()
        this.vault = await this.getVault()
      }
    } catch (e) {
      console.error(e)
      Sentry.captureException(e)
    }
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
      console.error(e)
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
      console.error(e)
      Sentry.captureException(e)
    }
  }

  private async setPublicProfile(data: UserData) {
    const entries = Object.entries(data)
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      await this.vault?.profiles.public.set(...entry)
    }
  }

  public async createAccount(userData: UserData): Promise<Account | undefined> {
    try {
      const ethWallet = Wallet.createRandom()
      const mnemonic = ethWallet.mnemonic
      const utils = new Utils(CERAMIC_URL)
      const ceramic = await utils.createAccount('3id', mnemonic)
      this.selectedAccount = {
        mnemonic: ethWallet.mnemonic,
        did: ceramic?.did?.id || '',
        privateKey: ethWallet.privateKey,
      }

      this.accounts.push(this.selectedAccount)
      await SecureStore.setItemAsync(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify(this.accounts)
      )
      await SecureStore.setItemAsync(
        SELECTED_ACCOUNT_STORAGE_KEY,
        this.selectedAccount.did
      )

      await this.init()

      await this.setPublicProfile(userData)

      return this.selectedAccount
    } catch (e) {
      Sentry.captureException(e)
      return undefined
    }
  }
}

export default AccountManager

import * as SecureStore from 'expo-secure-store'
import * as Sentry from '@sentry/react-native'
import { Client, Context } from '@verida/client-rn'
import { AutoAccount } from '@verida/account-node'
import { find } from 'lodash'
import { Wallet } from 'ethers'
import { Utils } from '@verida/3id-utils-node'
import { Account, UserData } from 'api/types'

const ACCOUNTS_STORAGE_KEY = 'accounts'
const ACCOUNT_STORAGE_KEY = 'account'
const SELECTED_CHAIN_STORAGE_KEY = 'selected-chain'
const CERAMIC_URL = 'https://ceramic.verida.io:7007'
const ENDPOINT_URL = 'https://db.testnet.verida.io:5002/'
const VERIDA_CONTEXT_NAME = 'Verida: Vault'
const DEFAULT_CHAIN = 'ethr'

class AccountManager {
  private accounts: Account[] = []
  private selectedAccount: Account | undefined
  private selectedChain: string = DEFAULT_CHAIN

  private static instance: AccountManager

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  private async init() {
    try {
      const accountsRaw = await SecureStore.getItemAsync(ACCOUNTS_STORAGE_KEY)
      if (accountsRaw) {
        this.accounts = JSON.parse(accountsRaw)
      }
      const selectedAccountDid = await SecureStore.getItemAsync(
        SELECTED_ACCOUNT_STORAGE_KEY
      )
      if (this.accounts.length > 0 && selectedAccountDid) {
        this.selectedAccount = find(
          this.accounts,
          (account) => account.did === selectedAccountDid
        )
      }

      this.selectedChain =
        (await SecureStore.getItemAsync(SELECTED_CHAIN_STORAGE_KEY)) ||
        DEFAULT_CHAIN
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  public getInstance(): AccountManager {
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

  private async setPublicProfile(data: UserData) {
    const vault = await getVault(wallet)
    const entries = Object.entries(data)
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      await vault.profiles.public.set(...entry)
    }
  }

  // public async createAccount(userData: UserData): Promise<Account | undefined> {
  //   try {
  //     const ethWallet = Wallet.createRandom()
  //     const mnemonic = ethWallet.mnemonic
  //     const utils = new Utils(CERAMIC_URL)
  //     const ceramic = await utils.createAccount('3id', mnemonic)
  //     this.selectedAccount = {
  //       mnemonic: ethWallet.mnemonic,
  //       did: ceramic?.did?.id || '',
  //     }
  //
  //     this.accounts.push(this.selectedAccount)
  //     await SecureStore.setItemAsync(
  //       ACCOUNT_STORAGE_KEY,
  //       JSON.stringify(this.accounts)
  //     )
  //     return this.selectedAccount
  //   } catch (e) {
  //     Sentry.captureException(e)
  //     return undefined
  //   }
  // }
}

export default AccountManager

import * as SecureStore from 'expo-secure-store'
import * as Sentry from '@sentry/react-native'
import { Client, Context, EnvironmentType } from '@verida/client-rn'
import { AutoAccount } from '@verida/account-node'
import { utils } from 'ethers'
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
export const VERIDA_CONTEXT_NAME = 'Verida: Vault'
export const MNEMONIC_LENGTH = 12
const VERIDA_ENVIRONMENT = EnvironmentType.TESTNET
const VERIDA_TESTNET_DEFAULT_SERVER = 'https://db.testnet.verida.io:5002/'

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
      }
    } catch (e) {
      console.error(e)
      Sentry.captureException(e)
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

  public async getVeridaContext(): Promise<Context | undefined> {
    try {
      if (!this.selectedAccount) {
        return undefined
      }
      const { mnemonic } = this.selectedAccount
      this.client = new Client({
        environment: VERIDA_ENVIRONMENT,
      })
      const account = new AutoAccount(
        {
          defaultDatabaseServer: {
            type: 'VeridaDatabase',
            endpointUri: VERIDA_TESTNET_DEFAULT_SERVER,
          },
          defaultMessageServer: {
            type: 'VeridaMessage',
            endpointUri: VERIDA_TESTNET_DEFAULT_SERVER,
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
      console.error(e)
      Sentry.captureException(e)
      throw e
    }
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

  public async createAccount(userData: UserData): Promise<Account | undefined> {
    try {
      const node = utils.HDNode.entropyToMnemonic(utils.randomBytes(16))

      this.selectedAccount = {
        mnemonic: node,
        did: '', // DID will be filled after connecting to Verida
      }

      await this.connect(true)
      await this.setPublicProfile(userData)

      store.dispatch(setSelectedAccount(this.selectedAccount))
      store.dispatch(addAccount(this.selectedAccount))

      return this.selectedAccount
    } catch (e) {
      console.error('Create account error:', e)
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
      Sentry.captureException(e)
      throw e
    }
  }

  public async switchToAccount(did: string) {
    try {
      this.selectedAccount = this.accounts[did]
      await SecureStore.setItemAsync(
        SELECTED_ACCOUNT_DID_STORAGE_KEY,
        this.selectedAccount.did
      )
      await this.connect(true)
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
        did: '',
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
        did: '',
      }

      await this.connect(true)
      // await this.setPublicProfile(userData)

      store.dispatch(setSelectedAccount(this.selectedAccount))
      store.dispatch(addAccount(this.selectedAccount))

      return this.selectedAccount
    } catch (e) {
      Sentry.captureException(e)
      throw e
    }
  }
}

export default AccountManager

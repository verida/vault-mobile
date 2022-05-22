// eslint-disable-next-line simple-import-sort/imports
import * as Sentry from '@sentry/react-native'
import { Client, Context, EnvironmentType } from '@verida/client-rn'
import { AutoAccount } from '@verida/account-node'
import Vault from '@verida/vault-common'
import WalletUtils from '@verida/wallet-utils'
import { utils } from 'ethers'
import * as SecureStore from 'expo-secure-store'
import { isEmpty } from 'lodash'
import store from 'reduxStore'

import { Account, NetworkNode, NormalizedAccounts, UserData } from 'api/types'
import dataMap from 'config/data-map'
import {
  addAccount,
  setAccounts,
  setSelectedAccount,
  setSwitchAccountToast,
  setVeridaContext,
  setVault,
  setVeridaClient
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

const filterDids = async() => {
  const accounts = store.getState().accounts
  let hasInvalidData = false
  Object.keys(accounts).map((did) => {
    if (did.includes('did:3')) {
      hasInvalidData = true
    }
  })

  if (hasInvalidData) {
    store.dispatch(setAccounts({}))
    await SecureStore.deleteItemAsync(ACCOUNTS_STORAGE_KEY)
    await SecureStore.deleteItemAsync(SELECTED_ACCOUNT_DID_STORAGE_KEY)
  }
}

const init = async() => {
  try {
    let selectedAccount = store.getState().selectedAccount
    let accounts = store.getState().accounts
    if (!selectedAccount) {
      const accountsRaw = await SecureStore.getItemAsync(ACCOUNTS_STORAGE_KEY)
      if (accountsRaw) {
        accounts = JSON.parse(accountsRaw)
        await filterDids()
        store.dispatch(setAccounts(accounts))
      }
      const selectedAccountDid = await SecureStore.getItemAsync(
        SELECTED_ACCOUNT_DID_STORAGE_KEY
      )

      if (!isEmpty(accounts) && selectedAccountDid) {
        selectedAccount = accounts[selectedAccountDid]
        store.dispatch(setSelectedAccount(selectedAccount))
      }

      const walletsRaw = await SecureStore.getItemAsync(WALLETS_STORAGE_KEY)
      // if there's no seed phrase in wallet data (and near address doesnt exist), create wallets again using seedphrase in verida store
      if (walletsRaw) {
        const wallets = JSON.parse(walletsRaw)
        if (wallets.seedPhrase || wallets.near) {
          const selectedAccount = getSelectedAccount()
          if (selectedAccount) {
            await connect()
          }

          await restoreUserWallet()
        } else {
          store.dispatch(saveUserWallets(wallets))
          const selectedWalletID = await SecureStore.getItemAsync(
            SELECTED_WALLET_STORAGE_KEY
          )
          await store.dispatch(setSelectedWallet(selectedWalletID))
        }
      } else {
        // else basically old account.. create a seedphrase and set wallet.
        await setUserWallet()
      }
    }
  } catch (e) {
    Sentry.captureException(e)
  }
}

const getSelectedAccount = () => {
  const selectedAccount = store.getState().selectedAccount
  return selectedAccount
}

const connect = async (forced = false, endpointUrls?: EndpointUrls) => {
  let context = store.getState().veridaContext
  let selectedAccount = store.getState().selectedAccount
  if (!forced && context) {
    return
  }
  console.log('Entered here 2', selectedAccount)
  context = await getVeridaContext(endpointUrls)
  store.dispatch(setVeridaContext(context))
  console.log('Entered here 8')
  let vault = await getVault()
  console.log('Entered here 12')
  store.dispatch(setVault(vault))
}

const getVeridaContext = async(
  endpointUrls?: EndpointUrls
) => {
  try {
    const selectedAccount = store.getState().selectedAccount
    if (!selectedAccount) {
      return undefined
    }
    console.log('Entered here 3')
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
    
    const { mnemonic } = selectedAccount
    const client = new Client({
      environment: VERIDA_ENVIRONMENT,
    })
    console.log('Entered here 4', selectedAccount)
    store.dispatch(setVeridaClient(client))

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
    // store.dispatch(setSelectedAccount(account))
    store.dispatch(addAccount(account))
    console.log('Entered here 5', account)
    // Fill the connected account with Verida DID
    if (isEmpty(selectedAccount.did)) {
      const did = await account.did()
      await updateCurrentAccount({ did })
    }
    console.log('Entered here 6')
    // Connect the Verida account to the Verida client
    await client.connect(account)
    console.log('Entered here 7')
    // Open an application context (forcing creation of a new context if it doesn't already exist)
    return await client.openContext(VERIDA_CONTEXT_NAME, true)
  } catch (e) {
    Sentry.captureException(e)
    throw e
  }
}

const getClient = () => {
  const client = store.getState().veridaClient
  return client
}

const getVault = async () => {
  try {
    const context = store.getState().veridaContext 
    const client = getClient()
    const vault = new Vault(client, context, dataMap)
    console.log('This is context', context)
    console.log('This is client', client)
    console.log('Entered Here 9')
    await vault.init()
    console.log('Entered Here 10')
    return vault
  } catch (e) {
    Sentry.captureException(e)
    throw e
  }
}

const setPublicProfile = async (data: UserData) => {
  const entries = Object.entries(data)
  const vault = store.getState().vault
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await vault?.profiles.public.set(...entry)
  }
}

const setBackedupSeedPhraseConfig = async (backedup: boolean) => {
  try {
    const context = store.getState().veridaContext
    const configDb = await context?.openDatabase(CONFIG_DB)
    await configDb?.save(
      { _id: SEED_PHRASE_BACKED_UP_CONFIG, value: backedup },
      {}
    )
  } catch (e) {
    Sentry.captureException(e)
    throw e
  }
}

const getBackedupSeedPhraseConfig = async() => {
  try {
    const context = store.getState().veridaContext
    const configDb = await context?.openDatabase(CONFIG_DB)
    return await configDb?.get(SEED_PHRASE_BACKED_UP_CONFIG, {})
  } catch (e) {
    Sentry.captureException(e)
    throw e
  }
}

const setUserWallet = async () => {
  try {
    const context = store.getState().veridaContext
    await store.dispatch(removeUserWallets())
    const userHDWalletMnemonic =
      WalletUtils.MultiChainWallet.generateMnemonic()

    // save mnemonic to verida store
    const walletDb = await context?.openDatastore(
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

const restoreUserWallet = async () => {
  try {
    const context = store.getState().veridaContext
    await store.dispatch(removeUserWallets())
    const datastore = await context?.openDatastore(
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

const createAccount = async (
  userData: UserData,
  country: string
) => {
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

    const selectedAccount = {
      mnemonic: node,
      did: '', // DID will be filled after connecting to Verida
      seedPhraseReminder: {
        lastTime: undefined,
        backedup: false,
      },
    }
    store.dispatch(setSelectedAccount(selectedAccount))
    console.log('Entered here 1', selectedAccount)
    await connect(true, endpointUris)
    console.log('Entered here 13')
    await setPublicProfile(userData)
    console.log('Entered here 14')
    await setBackedupSeedPhraseConfig(false)
    await setUserWallet()

    return selectedAccount
  } catch (e) {
    Sentry.captureException(e)
    throw e
  }
}

const logout = async (dids: string[] = []) => {
  let selectedAccount = store.getState().selectedAccount
  const accounts = store.getState().accounts
  if (!selectedAccount) {
    return
  }

  let selectedDids = dids
  if (dids.length === 0) {
    selectedDids = Object.keys(accounts)
  }
  try {
    await SecureStore.deleteItemAsync(WALLETS_STORAGE_KEY)
    await SecureStore.deleteItemAsync(SELECTED_WALLET_STORAGE_KEY)
    await store.dispatch(removeUserWallets())

    selectedDids.forEach((did) => {
      delete accounts[did]
    })

    if (isEmpty(selectedAccount)) {
      await SecureStore.deleteItemAsync(ACCOUNTS_STORAGE_KEY)
    } else {
      await SecureStore.setItemAsync(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify(accounts)
      )
    }

    if (selectedDids.includes(selectedAccount.did)) {
      store.dispatch(setSelectedAccount(undefined))
      store.dispatch(setVeridaContext(undefined))
      store.dispatch(setVeridaClient(undefined))
      store.dispatch(setVault(undefined))
      await SecureStore.deleteItemAsync(SELECTED_ACCOUNT_DID_STORAGE_KEY)
      store.dispatch(setSelectedAccount(null))
    }
    store.dispatch(setAccounts(accounts))
    selectedAccount = store.getState().selectedAccount
    // Switch to next account if the current account logged out
    if (!selectedAccount && Object.values(accounts).length > 0) {
      const nextAccount: any = Object.values(accounts)[0]
      if(nextAccount && nextAccount.did)
        await switchToAccount(nextAccount.did)
    }
  } catch (e) {
    Sentry.captureException(e)
    throw e
  }
}

const switchToAccount = async (did: string) => {
  try {
    const accounts = store.getState().accounts
    const selectedAccount = accounts[did]
    const { backedup } = selectedAccount.seedPhraseReminder
    if (!backedup) {
      selectedAccount.seedPhraseReminder.lastTime = Date.now()
    }
    await SecureStore.setItemAsync(
      SELECTED_ACCOUNT_DID_STORAGE_KEY,
      selectedAccount.did
    )
    await connect(true)
    await restoreUserWallet()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const name = await this.vault?.profiles.public.get('name')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const avatar = await this.vault?.profiles.public.get('avatar')

    store.dispatch(setSelectedAccount(selectedAccount))
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

const updateCurrentAccount = async (data: any) => {
  let selectedAccount = store.getState().selectedAccount
  let accounts = store.getState().accounts
  if (!selectedAccount) {
    selectedAccount = {
      mnemonic: '',
      did: '', // DID will be filled after connecting to Verida
      seedPhraseReminder: {
        lastTime: undefined,
        backedup: false,
      },
    }
  }

  selectedAccount = {
    ...(selectedAccount || {}),
    ...data,
  }
  accounts[selectedAccount.did] = selectedAccount
  store.dispatch(setAccounts(accounts))
  await SecureStore.setItemAsync(
    ACCOUNTS_STORAGE_KEY,
    JSON.stringify(accounts)
  )
  await SecureStore.setItemAsync(
    SELECTED_ACCOUNT_DID_STORAGE_KEY,
    selectedAccount.did
  )
}

const findIfMnemonicExists = (mnemonic: string) => {
  let accounts = store.getState().accounts
  return Object.values(accounts).some(
    (account: any) => account?.mnemonic === mnemonic
  )
}

const importAccount = async (mnemonic: string) => {
  let selectedAccount = {
    mnemonic,
    did: '', // DID will be filled after connecting to Verida
    seedPhraseReminder: {
      lastTime: undefined,
      backedup: false,
    },
  }
  try {
    if (findIfMnemonicExists(mnemonic)) {
      return null
    }
    
    await connect(true)
    store.dispatch(setSelectedAccount(selectedAccount))
    store.dispatch(addAccount(selectedAccount))

    await restoreUserWallet()
    return selectedAccount
  } catch (e) {
    if (selectedAccount) await logout([selectedAccount.did])
    Sentry.captureException(e)
    throw e
  }
}

const updateLastTimeSeedPhraseReminder = async (backedup: boolean) => {
  await updateCurrentAccount({
    seedPhraseReminder: {
      backedup,
      lastTime: Date.now(),
    },
  })
}

const checkIfVeridaTeamMember = async () =>  {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const vault = store.getState().vault
    const name = await vault?.profiles.public.get('name')
    return name.includes('_vda')
  } catch (e) {
    Sentry.captureException(e)
    throw e
  }
}

export default {
  connect,
  filterDids,
  init,
  getSelectedAccount,
  getVeridaContext,
  getClient,
  getVault,
  setPublicProfile,
  setBackedupSeedPhraseConfig,
  getBackedupSeedPhraseConfig,
  setUserWallet,
  restoreUserWallet,
  createAccount,
  logout,
  switchToAccount,
  updateCurrentAccount,
  findIfMnemonicExists,
  importAccount,
  updateLastTimeSeedPhraseReminder,
  checkIfVeridaTeamMember
}

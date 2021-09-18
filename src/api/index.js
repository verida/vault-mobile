import Vault from '@verida/vault-common'
import walletUtils from '@verida/wallet-utils'
import * as SecureStore from 'expo-secure-store'

import { Client } from '@verida/client-rn'
import { AutoAccount } from '@verida/account-node'

import dataMap from '../config/data-map'

const WALLET_KEY = 'VaultMobileWallet'
export const MNEMONIC_LENGTH = 12
const VERIDA_CONTEXT_NAME = 'Verida: Vault'
const DEFAULT_CHAIN = 'ethr'
const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com'
const CHAIN_KEY = 'chain'

export const storeChain = async (chain) => {
  global.chain = chain
  await SecureStore.setItemAsync(CHAIN_KEY, JSON.stringify(chain))
}

export const loadChain = async () => {
  if (global.chain) {
    return global.chain
  }

  const chain = await SecureStore.getItemAsync(CHAIN_KEY)
  global.chain = chain || DEFAULT_CHAIN
  return global.chain
}

export const generateWallet = async (userData) => {
  try {
    await loadChain()
    const newWallet = walletUtils.createWallet(global.chain)
    global.wallet = newWallet

    const vault = await getVault(newWallet)
    await Promise.all(
      Object.entries(userData).map((entry) => {
        return vault.profiles.public.set(...entry)
      })
    )

    await SecureStore.setItemAsync(WALLET_KEY, JSON.stringify(newWallet))
    return newWallet
  } catch (error) {
    console.log(error)
  }
}
export const walletByMnemonic = async (mnemonic) => {
  await loadChain()
  const wallet = walletUtils.getWallet(global.chain, mnemonic)
  await SecureStore.setItemAsync(WALLET_KEY, JSON.stringify(wallet))
}
export const clearWallet = async () => {
  global.client = null
  global.account = null
  global.verida = null
  global.vault = null
  global.wallet = null
  global.chain = null
  await SecureStore.deleteItemAsync(WALLET_KEY)
  await SecureStore.deleteItemAsync(CHAIN_KEY)
}
export const getWallet = async () => {
  if (global.wallet) {
    return global.wallet
  }

  const wallet = await SecureStore.getItemAsync(WALLET_KEY)
  if (wallet) {
    const result = JSON.parse(wallet)
    global.wallet = result
    return result
  }
  return {}
}
export const isAuthorized = async () => {
  const wallet = await SecureStore.getItemAsync(WALLET_KEY)
  return Boolean(wallet)
}

/**
 * Return a Verida Context instance for the `Verida: Vault` context.
 *
 * @param {*} wallet
 * @returns
 */
export const getVeridaApp = async (wallet) => {
  if (global.verida) {
    return global.verida
  }

  // create a promise to return to avoid `getVeridaApp` being called multiple times
  // eslint-disable-next-line no-async-promise-executor
  global.verida = new Promise(async (resolve, reject) => {
    try {
      await loadChain()
      if (!wallet) {
        wallet = await SecureStore.getItemAsync(WALLET_KEY)
        wallet = JSON.parse(wallet)
      }
      const { privateKey } = wallet
      const client = new Client({
        ceramicUrl: CERAMIC_URL,
      })
      const account = new AutoAccount(
        {
          defaultDatabaseServer: {
            type: 'VeridaDatabase',
            endpointUri: 'https://db.testnet.verida.io:5002/',
          },
          defaultMessageServer: {
            type: 'VeridaMessage',
            endpointUri: 'https://db.testnet.verida.io:5002/',
          },
        },
        {
          chain: global.chain,
          privateKey,
        }
      )
      await client.connect(account)
      const context = await client.openContext(VERIDA_CONTEXT_NAME, true)
      wallet.did = await account.did()

      global.account = account
      global.client = client

      resolve(context)
    } catch (error) {
      reject(error)
    }
  })

  return global.verida
}

export const getVault = async (wallet) => {
  if (global.vault) {
    return global.vault
  }

  // eslint-disable-next-line no-async-promise-executor
  global.vault = new Promise(async (resolve, reject) => {
    try {
      await loadChain()
      const verida = await getVeridaApp(wallet)
      const vault = new Vault(global.client, verida, dataMap)
      await vault.init()
      global.vault = vault

      const profileData = await vault.profiles.public.getMany()

      resolve(vault)
    } catch (error) {
      reject(error)
    }
  })

  return global.vault
}

/**
 *
 * @returns <Image/> source property
 */
const DefaultAvatar = require('../assets/stubs/avatar.png')

export const loadAvatarSource = async () => {
  try {
    const vault = await getVault()
    let avatar = await vault.profiles.public.get('avatar')
    if (!avatar) {
      return DefaultAvatar
    }

    avatar = JSON.parse(avatar)

    if (avatar) {
      let image
      switch (avatar.encoding) {
        case 'base64':
          image = {
            uri: `data:image/${avatar.format};base64,` + avatar.base64,
          }

          break
        default:
          return DefaultAvatar
      }

      return image
    }

    return DefaultAvatar
  } catch (error) {
    return DefaultAvatar
  }
}

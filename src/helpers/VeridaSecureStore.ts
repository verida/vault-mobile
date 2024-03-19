import { Buffer } from '@craftzdog/react-native-buffer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SystemSecureStore from 'expo-secure-store'
import { Logger } from 'features/telemetry'
import Crypto from 'react-native-quick-crypto'

const logger = Logger.create('VeridaSecureStore')

const SYSTEM_SECURE_STORAGE_NEEDS_MIGRATE = true
const SYSTEM_SECURE_STORAGE_KEY = 'verida-main-key'

export class Encrypter {
  static algorithm = 'aes256'

  private key: any
  private initialized = false
  private static instance: Encrypter

  public static getInstance(): Encrypter {
    if (!Encrypter.instance) {
      Encrypter.instance = new Encrypter()
    }

    return Encrypter.instance
  }

  private async initialize() {
    let mainKey = await SystemSecureStore.getItemAsync(
      SYSTEM_SECURE_STORAGE_KEY
    )

    if (!mainKey) {
      // Generate a random main key for encode/decode values
      mainKey = Buffer.from(Crypto.randomBytes(16)).toString('hex') // Hex string is double the number of bytes, so the mainKey length is 32 bytes
      await SystemSecureStore.setItemAsync(SYSTEM_SECURE_STORAGE_KEY, mainKey)
    }

    this.key = mainKey
    this.initialized = true
  }

  public async encrypt(clearText: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize()
    }

    const iv = Crypto.randomBytes(16)
    const cipher = Crypto.createCipheriv(Encrypter.algorithm, this.key, iv)
    const encrypted = cipher.update(clearText, 'utf8', 'hex')
    return [
      encrypted + cipher.final('hex'),
      Buffer.from(iv).toString('hex'),
    ].join('|')
  }

  public async decrypt(encryptedText: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize()
    }

    const [encrypted, iv] = encryptedText.split('|')
    if (!iv) throw new Error('IV not found')
    const decipher = Crypto.createDecipheriv(
      Encrypter.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    )
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
  }
}

export async function getItemAsync(key: string): Promise<string | null> {
  const encryptedValue = await AsyncStorage.getItem(key)

  // Migration
  if (SYSTEM_SECURE_STORAGE_NEEDS_MIGRATE && !encryptedValue) {
    const oldPlainValue = await SystemSecureStore.getItemAsync(key)
    if (oldPlainValue) {
      // save to the new secure store
      await setItemAsync(key, oldPlainValue)
      // delete the value from old store
      await SystemSecureStore.deleteItemAsync(key)

      logger.info('Migrated value for key', { key })
      return oldPlainValue
    }
  }

  // decrypt value on return
  const decryptedValue = encryptedValue
    ? await Encrypter.getInstance().decrypt(encryptedValue)
    : null

  return decryptedValue
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (value === undefined || value === null) {
    // delete null item
    await deleteItemAsync(key)
    return
  }

  // encrypt value on save it
  const encryptedValue = await Encrypter.getInstance().encrypt(value)
  await AsyncStorage.setItem(key, encryptedValue)
}

export async function deleteItemAsync(key: string): Promise<void> {
  await AsyncStorage.removeItem(key)
}

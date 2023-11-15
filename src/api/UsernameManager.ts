import { EnvironmentType, Web3CallType } from '@verida/types'
import { VeridaNameClient } from '@verida/vda-name-client'
import { config } from 'config'
import { Account } from 'features/identities'
import { Logger } from 'features/telemetry'

import AccountManager from './AccountManager'

const logger = new Logger('UsernameManager')

export default class UsernameManager {
  private static client?: VeridaNameClient
  static did: string

  private constructor() {
    // empty
  }

  /**
   * Check if a username exists
   *
   * @return boolean true if the username already exists
   */
  public static async usernameExists(username: string): Promise<boolean> {
    const client = await UsernameManager.getClient()

    try {
      const usernames = await client.getDID(username)

      return Boolean(usernames.length)
    } catch (err) {
      return false
    }
  }

  /**
   * Get usernames for the current DID
   *
   * Note: The protocol supports multiple usernames, but in
   * reality it will likely be just one. The protocol
   * currently limits to just one.
   *
   * @returns string[] Array of usernames
   */
  public static async get(): Promise<string[] | undefined> {
    try {
      const client = await UsernameManager.getClient()
      const account = await AccountManager.getInstance().getSelectedAccount()

      const did: string | undefined = account?.did

      if (!did) return undefined

      const match = did.match(/(0x.*)/)?.[0]

      if (!match) return undefined

      return await client.getUsernames(match)
    } catch (error: unknown) {
      logger.error(error)
      return
    }
  }

  /**
   * Set username for the current user
   *
   * @throws error if invalid username
   * @param username string New username
   * @param replaceExisting boolean True if any existing usernames should be deleted first
   */
  public static async set(
    username: string,
    replaceExisting = true
  ): Promise<void> {
    const client = await UsernameManager.getClient()

    if (replaceExisting) {
      const existingUsernames = await UsernameManager.get()
      if (existingUsernames) {
        for (const e in existingUsernames)
          await client.unregister(existingUsernames[e])
      }
    }
    await client.register(username)
  }

  private static async getClient() {
    const currentDID = await AccountManager.getInstance().getSelectedAccount()
      ?.did
    if (!currentDID) {
      throw new Error('Account not found')
    }

    // This's so the client will be reinitialized on DID change
    if (UsernameManager.client && currentDID === UsernameManager.did) {
      return UsernameManager.client
    }
    UsernameManager.did = currentDID

    const didClientConfig = config.VERIDA_DID_CLIENT_CONFIG
    const account = <Account>(
      await AccountManager.getInstance().getSelectedAccount()
    )

    const nameClient = new VeridaNameClient({
      callType: <Web3CallType>didClientConfig.callType,
      did: account.did,
      signKey: account.privateKey,
      network: <EnvironmentType>config.VERIDA_ENVIRONMENT,
      web3Options: didClientConfig.web3Config,
    })

    UsernameManager.client = nameClient

    return UsernameManager.client
  }
}

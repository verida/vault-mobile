import { VeridaNameClient } from '@verida/vda-name-client'

import CONFIG from '../config/environment'
import AccountManager from './AccountManager'

export default class UsernameManager {
  private client?: VeridaNameClient

  /**
   * Get usernames for the current DID
   *
   * Note: The protocol supports multiple usernames, but in
   * reality it will likely be just one. The protocol
   * currently limits to just one.
   *
   * @returns string[] Array of usernames
   */
  public async get(): Promise<string[] | undefined> {
    try {
      const client = await this.getClient()
      const account = await AccountManager.getInstance().getSelectedAccount()
      const usernames = await client.getUsernames(
        account!.did.match(/(0x.*)/)[0]
      )
      return usernames
    } catch (err) {
      console.log(err)
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
  public async set(username: string, replaceExisting = true): Promise<void> {
    const client = await this.getClient()

    if (replaceExisting) {
      const existingUsernames = await this.get()
      if (existingUsernames) {
        for (const e in existingUsernames) {
          const username = existingUsernames[e]
          await client.unregister(username)
        }
      }
    }
    await client.register(username)
  }

  private async getClient() {
    if (this.client) {
      return this.client
    }

    const didClientConfig = CONFIG.VERIDA_DID_CLIENT_CONFIG
    const account = await AccountManager.getInstance().getSelectedAccount()

    const nameClient = new VeridaNameClient({
      callType: didClientConfig.callType,
      identifier: account.did,
      signKey: account.privateKey,
      chainNameOrId: CONFIG.ENVIRONMENT,
      web3Options: didClientConfig.web3Config,
    })

    this.client = nameClient
    return this.client
  }
}

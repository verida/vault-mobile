import { Context } from '@verida/client-rn'
import { DatabasePermissionOptionsEnum, IDatastore } from '@verida/types'
import { Logger } from 'features/telemetry'

import AccountManager from 'api/AccountManager'

import {
  VERIDA_ONE_CONTEXT_NAME,
  VERIDA_ONE_PROFILE_SCHEMA_URL,
} from '../constants'
import {
  VeridaOneCustomLink,
  VeridaOneFeaturedAsset,
  VeridaOnePlatformLink,
  VeridaOneProfile,
  VeridaOneWalletAddress,
} from '../types'

const logger = Logger.create('VeridaOne')

const emptyVeridaOneProfile: VeridaOneProfile = {
  _id: 'public',
  customLinks: [],
  platformLinks: [],
  walletAddresses: [],
  featuredAssets: [],
}

// TODO: Replace this with a cached redux thunk with actions and selectors to update and get the profile data
export class VeridaOneManager {
  static context: Context
  static datastore: Promise<IDatastore>
  static did: string

  static async setCustomLinks(customLinks: VeridaOneCustomLink[]) {
    const profile = await VeridaOneManager.getProfile()
    profile.customLinks = customLinks
    await VeridaOneManager.saveProfile(profile)
  }

  static async setPlatformLinks(platformLinks: VeridaOnePlatformLink[]) {
    const profile = await VeridaOneManager.getProfile()
    profile.platformLinks = platformLinks
    await VeridaOneManager.saveProfile(profile)
  }

  static async setWalletAddresses(addresses: VeridaOneWalletAddress[]) {
    const profile = await VeridaOneManager.getProfile()
    profile.walletAddresses = addresses
    await VeridaOneManager.saveProfile(profile)
  }

  static async setFeaturedAssets(assets: VeridaOneFeaturedAsset[]) {
    const profile = await VeridaOneManager.getProfile()
    profile.featuredAssets = assets
    await VeridaOneManager.saveProfile(profile)
  }

  static async getProfile(): Promise<VeridaOneProfile> {
    const datastore = await VeridaOneManager.getDatastore()
    let profile = emptyVeridaOneProfile
    try {
      profile = await datastore.get('public', undefined)
    } catch (error: any) {
      if (error.error !== 'not_found') {
        logger.error(error)
      }
    }

    return profile
  }

  static async saveProfile(profile: VeridaOneProfile) {
    const datastore = await VeridaOneManager.getDatastore()
    const result = await datastore.save(profile, {})
    if (!result) {
      logger.warn(datastore.errors) // TODO: datastore.errors is really not convenient to use. Not sure the errors comes from the method we just called
    }
    const db = await datastore.getDb()
    await db.info()
  }

  static async getDatastore(): Promise<IDatastore> {
    const selectedDID = AccountManager.getInstance().getSelectedAccount()?.did
    if (!selectedDID) {
      throw new Error('Account not found')
    }

    // This's so the datastore will be reinitialized on DID change
    if (VeridaOneManager.datastore && selectedDID === VeridaOneManager.did) {
      return VeridaOneManager.datastore
    }
    VeridaOneManager.did = selectedDID

    // eslint-disable-next-line no-async-promise-executor
    VeridaOneManager.datastore = new Promise(async (resolve) => {
      const client = AccountManager.getInstance().client
      VeridaOneManager.context = <Context>(
        await client!.openContext(VERIDA_ONE_CONTEXT_NAME, true)
      )

      VeridaOneManager.datastore = VeridaOneManager.context.openDatastore(
        VERIDA_ONE_PROFILE_SCHEMA_URL,
        {
          permissions: {
            read: DatabasePermissionOptionsEnum.PUBLIC,
            write: DatabasePermissionOptionsEnum.OWNER,
          },
        }
      )

      resolve(VeridaOneManager.datastore)
    })

    return VeridaOneManager.datastore
  }
}

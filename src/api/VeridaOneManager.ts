import { Context } from '@verida/client-rn'
import { DatabasePermissionOptionsEnum, IDatastore } from '@verida/types'

import AccountManager from './AccountManager'
import {
  VeridaOneCustomLink,
  VeridaOneFeaturedAsset,
  VeridaOnePlatformLink,
  VeridaOneProfile,
  VeridaOneWalletAddress,
} from './types'

const VERIDA_ONE_CONTEXT = 'Verida: One'
const PROFILE_SCHEMA_URL =
  'https://common.schemas.verida.io/veridaOne/profile/v0.1.0/schema.json'

export default class VeridaOneManager {
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
    let profile
    try {
      profile = await datastore.get('public', undefined)
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.log(err)

      // @todo: test this
      if (err.error === 'not_found') {
        profile = <VeridaOneProfile>{
          _id: 'public',
          customLinks: [],
          platformLinks: [],
          walletAddresses: [],
          featuredAssets: [],
        }
      }
    }

    return profile
  }

  static async saveProfile(profile: VeridaOneProfile) {
    const datastore = await VeridaOneManager.getDatastore()
    const result = await datastore.save(profile, {})
    if (!result) {
      // eslint-disable-next-line no-console
      console.log(datastore.errors)
    }
    const db = await datastore.getDb()
    await db.info()
  }

  static async getDatastore(): Promise<IDatastore> {
    const selectedDID = await AccountManager.getInstance().getSelectedAccount()
      ?.did
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
        await client!.openContext(VERIDA_ONE_CONTEXT, true)
      )

      VeridaOneManager.datastore = VeridaOneManager.context.openDatastore(
        PROFILE_SCHEMA_URL,
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

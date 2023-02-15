import { Context } from '@verida/client-rn'
import { IDatastore, DatabasePermissionOptionsEnum } from '@verida/types'

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
      profile = await datastore.get('public')
    } catch (err: any) {
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
      // @ts-ignore
      console.log(datastore.errors)
    }
    console.log(result)
    const db = await datastore.getDb()
    const info = await db.info()
    console.log(info)
  }

  static async getDatastore(): Promise<IDatastore> {
    if (VeridaOneManager.datastore) {
      return VeridaOneManager.datastore
    }

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

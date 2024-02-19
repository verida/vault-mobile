import { AbstractPrivateKeyStore } from '@0xpolygonid/js-sdk'
import { IDatabase } from '@verida/types'
import { VeridaRecord, VeridaUnsavedRecord } from 'features/verida'

type VeridaPolygonIdUnsavedRecord = VeridaUnsavedRecord<{ value: string }>
type VeridaPolygonIdRecord = VeridaRecord<{ value: string }>

/**
 * Verida KeyStore that allows to import and get keys by alias.
 */
export class VeridaPolygonIdPrivateKeyStore implements AbstractPrivateKeyStore {
  private database: IDatabase

  public constructor(database: IDatabase) {
    this.database = database
  }

  public async importKey(args: { alias: string; key: string }): Promise<void> {
    const record: Omit<VeridaPolygonIdUnsavedRecord, 'schema'> = {
      _id: args.alias,
      value: args.key,
    }

    try {
      const existingRecord = (await this.database.get(args.alias)) as
        | VeridaPolygonIdRecord
        | undefined
      if (existingRecord) {
        record._rev = existingRecord._rev
      }

      // Not sure why we are overwriting the rev and saving again with no modifications
    } catch (error) {
      // not found, which is fine
    }

    await this.database.save(record)
  }

  public async get(args: { alias: string }): Promise<string> {
    try {
      const result = (await this.database.get(
        args.alias
      )) as VeridaPolygonIdRecord
      if (!result) {
        throw new Error('No key under given alias')
      }

      return result.value
    } catch (error) {
      throw new Error('No key under given alias')
    }
  }
}

import { IDatabase } from '@verida/types'
import { VeridaRecord, VeridaUnsavedRecord } from 'features/verida'

type PolygonIdVeridaMerkleTreeUnsavedRecord = VeridaUnsavedRecord<{
  data: string
}>
type PolygonIdVeridaMerkleTreeRecord = VeridaRecord<{ data: string }>

export class PolygonIdVeridaMerkleTreeDataSource {
  private database: IDatabase

  public constructor(database: IDatabase) {
    this.database = database
  }

  public async save(key: string, value: string): Promise<void> {
    let record: Omit<PolygonIdVeridaMerkleTreeUnsavedRecord, 'schema'> = {
      _id: key,
      data: value,
    }

    try {
      const existingRecord = (await this.database.get(key)) as
        | PolygonIdVeridaMerkleTreeRecord
        | undefined
      if (existingRecord) {
        record = existingRecord // Overwrite the meta properties from the existing record
      }
    } catch (error) {
      // not found, which is fine
    }

    // Overwrite the data to save
    record.data = value

    await this.database.save(record)
  }

  public async get(key: string) {
    try {
      const result = (await this.database.get(key)) as
        | PolygonIdVeridaMerkleTreeRecord
        | undefined
      return result?.data
    } catch (_error) {
      // No record found, Pouch throws a 'missing' error
      return undefined
    }
  }

  public async load() {
    const data = (await this.database.getMany(
      {},
      {
        limit: 1000,
      }
    )) as PolygonIdVeridaMerkleTreeRecord[]

    return data.map((item) => item.data)
  }

  public async delete(key: string): Promise<void> {
    const record = await this.database.get(key)
    await this.database.delete(record)
  }
}

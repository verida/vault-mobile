import { IDataSource } from '@0xpolygonid/js-sdk'
import { IDatabase } from '@verida/types'
import { VeridaRecord, VeridaUnsavedRecord } from 'features/verida'

type PolygonIdVeridaUnsavedRecord<Type> = VeridaUnsavedRecord<{ data: Type }>
type PolygonIdVeridaRecord<Type> = VeridaRecord<{ data: Type }>

/**
 * Generic Verida data source
 */
export class PolygonIdVeridaDataSource<T = unknown> implements IDataSource<T> {
  private database: IDatabase

  public constructor(database: IDatabase) {
    this.database = database
  }

  /** saves in the memory */
  public async save(key: string, value: T, keyName = 'id'): Promise<void> {
    let record: Omit<PolygonIdVeridaUnsavedRecord<T>, 'schema'> = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore as the value and keyName as coming from a suposedly trusted third-party (Polygon ID)
      _id: value[keyName],
      data: value,
    }

    try {
      const existingRecord = (await this.database.get(key)) as
        | PolygonIdVeridaRecord<T>
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

  /** updates in the memory */
  patchData(_value: T[]): void {
    throw new Error('Not implemented')
  }

  /** gets value from the memory */
  public async get(key: string, _keyName = 'id'): Promise<T | undefined> {
    const result = (await this.database.get(key)) as
      | PolygonIdVeridaRecord<T>
      | undefined
    return result?.data
  }

  /** loads from value from the memory */
  public async load(): Promise<T[]> {
    const data = (await this.database.getMany(
      {},
      {
        limit: 1000,
      }
    )) as PolygonIdVeridaRecord<T>[]

    return data.map((item) => item.data)
  }

  /** deletes from value from the memory */
  public async delete(key: string, _keyName = 'id'): Promise<void> {
    const record: any = await this.database.get(key)
    await this.database.delete(record)
  }
}

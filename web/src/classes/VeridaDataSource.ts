import { IDataSource } from "@0xpolygonid/js-sdk";
import { IDatabase } from "@verida/types";

/**
 * Generic data source
 */
export class VeridaDataSource<T> implements IDataSource<T> {
  private database: IDatabase;

  public constructor(database: IDatabase) {
    this.database = database;
  }

  /** saves in the memory */
  public async save(key: string, value: T, keyName = "id"): Promise<void> {
    let record: any = {};
    try {
      record = await this.database.get(key);
    } catch (error: unknown) {
      // @ts-ignore
      record._id = value[keyName];
    }
    record.data = value;

    await this.database.save(record);
  }

  /** updates in the memory */
  patchData(value: T[]): void {
    throw new Error("patchData Not supported");
  }

  /** gets value from from the memory */
  public async get(key: string, keyName = "id"): Promise<T | undefined> {
    const result = (await this.database.get(key)) as T;
    // @ts-ignore
    return result.data;
  }

  /** loads from value from the memory */
  public async load<T = any>(): Promise<T[]> {
    const data = (await this.database.getMany(
      {},
      {
        limit: 1000,
      }
    )) as T[];

    // @ts-ignore
    return data.map((item) => item.data);
  }

  /** deletes from value from the memory */
  public async delete(key: string, keyName = "id"): Promise<void> {
    const record: any = await this.database.get(key);
    await this.database.delete(record);
  }
}

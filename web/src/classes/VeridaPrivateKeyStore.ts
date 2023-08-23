import { AbstractPrivateKeyStore } from "@0xpolygonid/js-sdk";
import { IDatabase } from "@verida/types";
import { logger } from "../utils";

/**
 * KeyStore that allows to import and get keys by alias.
 *
 * @export
 * @abstract
 * @beta
 * @class AbstractPrivateKeyStore
 */
export class VeridaPrivateKeyStore implements AbstractPrivateKeyStore {
  private database: IDatabase;

  public constructor(database: IDatabase) {
    this.database = database;
  }

  //{"alias": "BJJ:d159756b0ce8ea6b0be569d1ba9ff63a4d8099c59bb6edb2aa8f5b3bcd9b1109", "key": "6461766573656564736565647365656473656564736565647365656475736572"}
  //did:polygonid:polygon:mumbai:2qHtz8rrerMMAFEcQSRu6Mvajxx7vkNLptw7LSS6C4
  /**
   * imports key by alias
   *
   * @abstract
   * @param {{ alias: string; key: string }} args - key alias and hex representation
   * @returns `Promise<void>`
   */
  public async importKey(args: { alias: string; key: string }): Promise<void> {
    const record = {
      _id: args.alias,
      value: args.key,
    };

    try {
      const existingRecord = await this.database.get(args.alias);
      // @ts-ignore
      record._rev = existingRecord._rev;
    } catch (error: unknown) {
      // not found, which is fine
    }

    try {
      await this.database.save(record);
    } catch (error: unknown) {
      logger.warn("Error while importing key by alias");
      throw error;
    }
  }

  /**
   * get key by alias
   *
   * @abstract
   * @param {{ alias: string }} args -key alias
   * @returns `Promise<string>`
   */
  public async get(args: { alias: string }): Promise<string> {
    try {
      const result: any = await this.database.get(args.alias);
      if (!result) {
        throw new Error("No key under given alias");
      }

      return result.value;
    } catch (error: unknown) {
      throw new Error("No key under given alias");
    }
  }
}

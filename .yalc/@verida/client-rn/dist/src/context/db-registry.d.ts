import { Context } from "..";
import { IDatabase, IDbRegistry } from "@verida/types";
/**
 * Maintain a registry of all databases owned by the current user
 * in a given context
 */
/**
 * @category
 * Modules
 */
declare class DbRegistry implements IDbRegistry {
    private context;
    private dbStore?;
    constructor(context: Context);
    /**
     *
     * @param {*} dbName
     * @param {*} did
     * @param {*} appName
     * @param {*} permissions
     * @param {*} encryptionKey Buffer representing the encryption key
     * @param {*} options
     */
    saveDb(database: IDatabase, checkPermissions?: boolean): Promise<void>;
    removeDb(databaseName: string, did: string, contextName: string): Promise<boolean>;
    getMany(filter?: any, options?: any): Promise<object[]>;
    get(dbName: string, did: string, contextName: string): Promise<any>;
    private buildDatabaseId;
    init(): Promise<void>;
}
export default DbRegistry;

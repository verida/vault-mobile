/// <reference types="pouchdb-core" />
declare const EventEmitter: any;
import { Context } from "../../../..";
import StorageEngineVerida from "./engine";
import Endpoint from "./endpoint";
import { DatabaseCloseOptions, DatabaseDeleteConfig, DatabasePermissionsConfig, DbRegistryEntry, EndpointUsage, IDatabase } from "@verida/types";
import { VeridaDatabaseConfig } from "./interfaces";
/**
 * @category
 * Modules
 */
declare class BaseDb extends EventEmitter implements IDatabase {
    protected databaseName: string;
    protected databaseHash: string;
    protected did: string;
    protected endpoint: Endpoint;
    protected storageContext: string;
    protected engine: StorageEngineVerida;
    protected permissions: DatabasePermissionsConfig;
    protected isOwner?: boolean;
    protected signContext: Context;
    protected signData?: boolean;
    protected signContextName: string;
    protected dbConnections: Record<string, any>;
    protected db?: any;
    constructor(config: VeridaDatabaseConfig, engine: StorageEngineVerida);
    getEngine(): StorageEngineVerida;
    /**
     * Save data to an application schema.
     *
     * @param {object} data Data to be saved. Will be validated against the schema associated with this Datastore.
     * @param {object} [options] Database options that will be passed through to [PouchDB.put()](https://pouchdb.com/api.html#create_document)
     * @fires Database#beforeInsert Event fired before inserting a new record
     * @fires Database#beforeUpdate Event fired before updating a new record
     * @fires Database#afterInsert Event fired after inserting a new record
     * @fires Database#afterUpdate Event fired after updating a new record
     * @example
     * let result = await datastore.save({
     *  "firstName": "John",
     *  "lastName": "Doe"
     * });
     *
     * if (!result) {
     *  console.errors(datastore.errors);
     * } else {
     *  console.log("Successfully saved");
     * }
     * @returns {boolean} Boolean indicating if the save was successful. If not successful `this.errors` will be populated.
     */
    save(data: any, options?: any): Promise<boolean>;
    /**
     * Get many rows from the database.
     *
     * @param {object} filter Optional query filter matching CouchDB find() syntax.
     * @param {object} options Options passed to CouchDB find().
     * @param {object} options.raw Returns the raw CouchDB result, otherwise just returns the documents
     */
    getMany(filter?: any, options?: any): Promise<object[]>;
    delete(doc: any, options?: any): Promise<boolean>;
    deleteAll(): Promise<void>;
    get(docId: string, options?: any): Promise<any>;
    /**
     * Bind to changes to this database
     *
     * @param {function} cb Callback function that fires when new data is received
     */
    changes(cb: Function, options?: any): Promise<any>;
    init(): Promise<void>;
    replaceEndpoint(): Promise<void>;
    /**
     * Update the users that can access the database
     */
    updateUsers(readList?: string[], writeList?: string[]): Promise<void>;
    registryEntry(): Promise<DbRegistryEntry>;
    protected _beforeInsert(data: any): Promise<any>;
    protected _beforeUpdate(data: any): Promise<any>;
    protected _afterInsert(data: any, response: any): void;
    protected _afterUpdate(data: any, response: any): void;
    /**
     * Get the underlying PouchDB instance associated with this database.
     *
     * @see {@link https://pouchdb.com/api.html#overview|PouchDB documentation}
     * @returns {PouchDB}
     */
    getDb(): Promise<any>;
    /**
     * See PouchDB bug: https://github.com/pouchdb/pouchdb/issues/6399
     *
     * This method automatically detects any fields being sorted on and
     * adds them to an $and clause to ensure query indexes are used.
     *
     * Note: This still requires the appropriate index to exist for
     * sorting to work.
     */
    private applySortFix;
    /**
     * Sign data as the current user
     *
     * @param {*} data
     * @todo Think about signing data and versions / insertedAt etc.
     */
    protected _signData(data: any): Promise<any>;
    getAccessToken(): any;
    setAccessToken(token: string): Promise<void>;
    info(): Promise<any>;
    close(options?: DatabaseCloseOptions): Promise<void>;
    destroy(options: DatabaseDeleteConfig): Promise<void>;
    usage(): Promise<EndpointUsage>;
}
export default BaseDb;

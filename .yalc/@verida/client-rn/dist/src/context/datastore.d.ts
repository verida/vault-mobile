import Context from "./context";
import { IDatastore, DatastoreOpenConfig, DatabaseCloseOptions } from "@verida/types";
/**
 * A datastore wrapper around a given database and schema.
 *
 * @property {array} errors Array of most recent errors.
 * @property {string} schemaName Name of the schema used on this Datastore.
 */
/**
 * @category
 * Modules
 */
declare class Datastore implements IDatastore {
    protected schemaName: string;
    protected schemaPath?: string;
    protected schema?: any;
    protected context: Context;
    protected config: DatastoreOpenConfig;
    private db;
    /**
     * A list of the latest database errors.
     *
     * Any errors from saving a record will be available on this public object.
     *
     * The errors remain until they are replaced by any new errors.
     */
    errors: object;
    /**
     * Create a new Datastore.
     *
     * **Do not instantiate directly.**
     */
    constructor(schemaName: string, context: Context, config?: DatastoreOpenConfig);
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
    save(data: any, options?: any): Promise<object | boolean>;
    /**
     * Fetch a list of records from this Datastore.
     *
     * Only returns records that belong to this Datastore's schema.
     *
     * Example filters and options:
     *
     * ```
     * let filter = {
     *      organization: 'Google'
     * };
     *
     * let options = {
     *      limit: 20,
     *      skip: 0,
     *      sort: ['firstName'
     * };
     * ```
     *
     * @param {object} [customFilter] An optional database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @param {object} [options] Optional database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @example
     * let results = datastore.getMany({
     *  name: 'John'
     * });
     *
     * console.log(results);
     * @returns {object[]} An array of database records.
     */
    getMany(customFilter?: any, options?: any): Promise<object[]>;
    /**
     * Get a single database record that matches.
     *
     * @param {object} [customFilter] An optional database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @param {object} [options] Optional database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @returns {object | undefined} A database record
     */
    getOne(customFilter?: any, options?: any): Promise<object | undefined>;
    /**
     * Get a record by ID.
     *
     * @param {string} key Unique ID of the record to fetch
     * @param {object} [options] Database options that will be passed through to [PouchDB.get()](https://pouchdb.com/api.html#fetch_document)
     */
    get(key: string, options?: any): Promise<any>;
    /**
     * Delete a record by ID.
     *
     * @param {string} docId Unique ID of the record to delete
     */
    delete(docId: string): Promise<any>;
    deleteAll(): Promise<void>;
    /**
     * Get the underlying database instance associated with this datastore.
     *
     * **Note: Do not use unless you know what you're doing as you can easily corrupt a database by breaking schema data.**
     */
    getDb(): Promise<any>;
    /**
     * Bind to changes to this datastore
     *
     * @param {function} cb Callback function that fires when new data is received
     * @param {object} options Options to be passed to the listener. See https://pouchdb.com/api.html#changes
     * @returns {object} Returns an object with a `.cancel()` method to cancel the listener
     */
    changes(cb: any, options?: any): Promise<any>;
    /**
     * Initialize this datastore instance before use.
     *
     * @todo: move this into context.openDatastore???
     */
    private init;
    /**
     * @todo: Support removing indexes that were deleted from the spec
     * @todo: Validate indexes
     *
     * @param indexes
     */
    ensureIndexes(indexes: any): Promise<void>;
    /**
     * Update the list of valid users for this datastore.
     *
     * @param readList {string[]} List of DID's that can read from this datastore.
     * @param writeList {writeList[]} List of DID's that can write to this datastore.
     */
    updateUsers(readList?: string[], writeList?: string[]): Promise<void>;
    close(options?: DatabaseCloseOptions): Promise<void>;
}
export default Datastore;

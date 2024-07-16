/// <reference types="pouchdb-core" />
/// <reference types="node" />
import { VeridaDatabaseConfig } from "./interfaces";
import BaseDb from "./base-db";
import StorageEngineVerida from "./engine";
import { DatabaseCloseOptions, DatabaseDeleteConfig, DbRegistryEntry } from "@verida/types";
/**
 * @category
 * Modules
 */
declare class EncryptedDatabase extends BaseDb {
    protected encryptionKey: Buffer;
    protected password?: string;
    private _sync;
    private _syncStatus?;
    private _localDbEncrypted;
    private _localDb;
    private _closing;
    private _syncError;
    /**
     *
     */
    constructor(config: VeridaDatabaseConfig, engine: StorageEngineVerida);
    init(): Promise<void>;
    protected initSync(): Promise<void>;
    /**
     * Restarts the remote database syncing
     *
     * This will clear all sync event listeners.
     * It will retain event listeners on the actual database (subscribed via `changes()`)
     *
     * @returns PouchDB Sync object
     */
    sync(): any;
    /**
     * Subscribe to sync events
     *
     * See https://pouchdb.com/api.html#sync
     *
     * ie:
     *
     * ```
     * const listener = database.onSync('error', (err) => { console.log(err) })
     * listener.cancel()
     * ```
     *
     * @param event
     * @param handler
     */
    onSync(event: string, handler: Function): any;
    /**
     * Close a database.
     *
     * This will remove all event listeners.
     */
    close(options?: DatabaseCloseOptions): Promise<void>;
    private finalizeSync;
    destroy(options?: DatabaseDeleteConfig): Promise<void>;
    private _destroy;
    updateUsers(readList?: string[], writeList?: string[]): Promise<void>;
    getDb(): Promise<any>;
    getRemoteEncrypted(): Promise<any>;
    getLocalEncrypted(): Promise<any>;
    getEncryptionKey(): Uint8Array;
    info(): Promise<any>;
    registryEntry(): Promise<DbRegistryEntry>;
}
export default EncryptedDatabase;

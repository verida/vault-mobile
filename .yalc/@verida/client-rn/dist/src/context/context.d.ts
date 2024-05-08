/// <reference types="node" />
import { EventEmitter } from 'events';
import DIDContextManager from "../did-context-manager";
import Datastore from "./datastore";
import Client from "../client";
import { Profile } from "./profiles/profile";
import DbRegistry from "./db-registry";
import { IAccount, IContext, IDatabase, IMessaging, INotification, MessagesConfig, DatabaseOpenConfig, DatastoreOpenConfig, ContextInfo, ContextEngineType, ContextCloseOptions, SecureContextConfig, AuthTypeConfig, AuthContext, IStorageEngine } from '@verida/types';
/**
 * An application context is a silo'd container of data for a specific application.
 *
 * It supports:
 *
 * - Database storage (encrypted, public, permissioned, queries, indexes)
 * - Messaging (between users and applications)
 * - Block storage (large files such as images and video) -- Coming soon
 */
/**
 * @category
 * Modules
 */
declare class Context extends EventEmitter implements IContext {
    private client;
    private account?;
    private messagingEngine?;
    private notificationEngine?;
    private contextName;
    private didContextManager;
    private databaseEngines;
    private dbRegistry;
    private databaseCache;
    /**
     * Instantiate a new context.
     *
     * **Do not use directly**. Use `client.openContext()` or `Network.connect()`.
     *
     * @param client {Client}
     * @param contextName {string}
     * @param didContextManager {DIDContextManager}
     * @param account {AccountInterface}
     */
    constructor(client: Client, contextName: string, didContextManager: DIDContextManager, account?: IAccount);
    getContextConfig(did?: string, forceCreate?: boolean, customContextName?: string): Promise<SecureContextConfig>;
    getContextName(): string;
    getAccount(): IAccount;
    getDidContextManager(): DIDContextManager;
    getClient(): Client;
    disconnect(): Promise<boolean>;
    /**
     * Get a storage engine for a given DID and this contextName
     *
     * @param did
     * @returns {BaseStorageEngine}
     */
    getDatabaseEngine(did: string, createContext?: boolean): Promise<IStorageEngine>;
    /**
     * Get a messaging instance for this application context.
     *
     * Allows you to send and receive messages as the currently connected account.
     *
     * @returns {Messaging} Messaging instance
     */
    getMessaging(messageConfig?: MessagesConfig): Promise<IMessaging>;
    getNotification(did: string, contextName: string): Promise<INotification | undefined>;
    /**
     * Get a user's profile.
     *
     * @param profileName string Name of the Verida profile schema to load
     * @param did string DID of the profile to get. Leave blank to fetch a read/write profile for the currently authenticated user
     * @returns {Profile}
     */
    openProfile(profileName?: string, did?: string): Promise<Profile | undefined>;
    /**
     * Open a database owned by this account.
     *
     * @param databaseName {string} Name of the database to open
     * @param options {DatabaseOpenConfig} Optional database configuration
     *
     * @returns {Promise<Database>}
     */
    openDatabase(databaseName: string, config?: DatabaseOpenConfig): Promise<IDatabase>;
    /**
     * Open an external database owned by an account that isn't the currently connected account.
     *
     * @param databaseName {string} Name of the database to open
     * @param did {string} DID of the external account that owns the database
     * @param options {DatabaseOpenConfig} Optional database configuration
     * @returns {Database}
     */
    openExternalDatabase(databaseName: string, did: string, config?: DatabaseOpenConfig): Promise<IDatabase>;
    deleteDatabase(databaseName: string): Promise<void>;
    /**
     * Open a dataastore owned by this account.
     *
     * @param schemaUri {string} URI of the schema to open (ie: https://common.schemas.verida.io/health/activity/latest/schema.json)
     * @param config {DatastoreOpenConfig} Optional datastore configuration
     * @returns {Datastore}
     */
    openDatastore(schemaUri: string, config?: DatastoreOpenConfig): Promise<Datastore>;
    /**
     * Open an external datastore owned by an account that isn't the currently connected account.
     *
     * @param schemaUri {string} URI of the schema to open (ie: https://common.schemas.verida.io/health/activity/latest/schema.json)
     * @param did {string} DID of the external account that owns the database
     * @param options {DatabaseOpenConfig} Optional database configuration
     * @returns {Datastore}
     */
    openExternalDatastore(schemaUri: string, did: string, options?: DatastoreOpenConfig): Promise<Datastore>;
    getDbRegistry(): DbRegistry;
    /**
     * Get the status of this context for databases, their connected endpoints and databases
     *
     * @returns
     */
    info(): Promise<ContextInfo>;
    getAuthContext(authConfig?: AuthTypeConfig, authType?: string): Promise<AuthContext>;
    /**
     * Emits `progress` event when adding the endpoint has progressed (ie: replicating databases to the new endpoint).
     *
     * @param engineType
     * @param endpointUri
     */
    addEndpoint(engineType: ContextEngineType, endpointUri: string): Promise<void>;
    /**
     * Close this context.
     *
     * Closes all open database connections, returns resources, cancels event listeners
     */
    close(options?: ContextCloseOptions): Promise<void>;
    clearDatabaseCache(did: string, databaseName: string): Promise<void>;
}
export default Context;

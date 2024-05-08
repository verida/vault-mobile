import BaseStorageEngine from "../../base";
import { Account } from "@verida/account";
import DbRegistry from "../../../db-registry";
import Context from '../../../context';
import Endpoint from "./endpoint";
import { ContextDatabaseInfo, DatabaseOpenConfig, DatabaseDeleteConfig, DatabasePermissionsConfig, IDatabase, SecureContextConfig } from "@verida/types";
/**
 * @todo
 *
 * base -> database (new wrapper with same interface, handles sync between endpoints, exposes a single endpoint database) -> endpoints (old database with client and public database suport)
 */
/**
 * @emits EndpointUnavailable
 * @emits EndpointWarning
 */
declare class StorageEngineVerida extends BaseStorageEngine {
    private accountDid?;
    private endpoints;
    private activeEndpoint?;
    constructor(context: Context, dbRegistry: DbRegistry, contextConfig: SecureContextConfig);
    locateAvailableEndpoint(endpoints: Record<string, Endpoint>, checkStatus?: boolean): Promise<Endpoint>;
    /**
     * Get an active endpoint
     */
    getActiveEndpoint(checkStatus?: boolean, clearActive?: boolean): Promise<Endpoint>;
    getEndpoint(endpintUri: string): Endpoint;
    getEndpoints(): Record<string, Endpoint>;
    connectAccount(account: Account): Promise<void>;
    /**
     * Open a database either that may or may not be owned by this usesr
     *
     * @param databaseName
     * @param options
     * @returns {Database}
     */
    openDatabase(databaseName: string, options: DatabaseOpenConfig): Promise<IDatabase>;
    logout(): void;
    /**
     * Call checkReplication() on all the endpoints
     */
    checkReplication(databaseName?: string): Promise<void>;
    /**
     * Call createDb() on all the endpoints
     */
    createDb(databaseName: string, did: string, permissions: DatabasePermissionsConfig): Promise<void>;
    /**
     * Call updateDb() on all the endpoints
     */
    updateDatabase(databaseName: string, options: any): Promise<void>;
    /**
     * Call deleteDatabase() on all the endpoints
     */
    deleteDatabase(databaseName: string, config?: DatabaseDeleteConfig): Promise<void>;
    info(): Promise<ContextDatabaseInfo>;
    closeDatabase(did: string, databaseName: string): Promise<void>;
}
export default StorageEngineVerida;

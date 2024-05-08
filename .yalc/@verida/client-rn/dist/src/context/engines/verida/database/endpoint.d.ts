/// <reference types="node" />
import { EventEmitter } from 'events';
import { ServiceEndpoint } from 'did-resolver';
import { Account } from '@verida/account';
import StorageEngineVerida from './engine';
import { DatabasePermissionsConfig, EndpointUsage, SecureContextConfig, VeridaDatabaseAuthContext } from '@verida/types';
/**
 * @emits EndpointWarning
 */
export default class Endpoint extends EventEmitter {
    private contextName;
    private endpointUri;
    private client;
    private contextConfig;
    private storageEngine;
    private account?;
    private auth?;
    private couchDbHost?;
    private usePublic;
    private databases;
    constructor(storageEngine: StorageEngineVerida, contextName: string, contextConfig: SecureContextConfig, endpointUri: ServiceEndpoint);
    setUsePublic(): Promise<void>;
    toString(): string;
    connectAccount(account: Account, isOwner?: boolean): Promise<void>;
    connectDb(did: string, databaseName: string, permissions: DatabasePermissionsConfig, isOwner: boolean): Promise<any>;
    disconnectDatabase(did: string, databaseName: string): Promise<void>;
    /**
     * Re-authenticate this endpoint and update the credentials
     * for the database.
     *
     * This is called by the internal fetch() methods when they detect an invalid access token
     *
     * @ todo: redo
     */
    authenticate(isOwner: boolean): Promise<void>;
    setAuth(auth: VeridaDatabaseAuthContext): Promise<void>;
    getStatus(): Promise<import("axios").AxiosResponse<any>>;
    getAccessToken(): Promise<string>;
    setAuthContext(authContext: VeridaDatabaseAuthContext): Promise<void>;
    createDb(databaseName: string, permissions: DatabasePermissionsConfig, retry: boolean): Promise<void>;
    updateDatabase(databaseName: string, options: any): Promise<void>;
    deleteDatabase(databaseName: string): Promise<void>;
    checkReplication(databaseName?: string): Promise<any>;
    /**
     * When connecting to a CouchDB server for an external user, the current user may not
     * have access to read/write.
     *
     * Take the external user's `endpointUri` that points to their CouchDB server. Establish
     * a connection to the Verida Middleware (DatastoreServerClient) as the current user
     * (accountDid) and create a new account if required.
     *
     * Return the current user's DSN which provides authenticated access to the external
     * user's CouchDB server for the current user.
     *
     * @returns {string}
     */
    protected buildExternalAuth(): Promise<VeridaDatabaseAuthContext>;
    getUsage(retry: boolean): Promise<EndpointUsage>;
    getDatabases(retry: boolean): Promise<void>;
    getDatabaseInfo(databaseName: string, retry: boolean): Promise<any>;
    logout(): void;
}

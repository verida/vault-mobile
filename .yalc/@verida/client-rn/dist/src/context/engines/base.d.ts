/// <reference types="node" />
import { Account } from "@verida/account";
import { Keyring } from "@verida/keyring";
import Datastore from "../datastore";
import DbRegistry from "../db-registry";
import Context from '../context';
import { EventEmitter } from 'events';
import { ContextDatabaseInfo, DatabaseDeleteConfig, DatabaseOpenConfig, DatastoreOpenConfig, IDatabase, SecureContextConfig } from "@verida/types";
/**
 * @emits EndpointUnavailable
 */
declare class BaseStorageEngine extends EventEmitter {
    protected context: Context;
    protected storageContext: string;
    protected dbRegistry: DbRegistry;
    protected contextConfig: SecureContextConfig;
    protected account?: Account;
    protected keyring?: Keyring;
    constructor(context: Context, dbRegistry: DbRegistry, contextConfig: SecureContextConfig);
    getKeyring(): Keyring | undefined;
    getContextConfig(): SecureContextConfig;
    getAccount(): Account | undefined;
    connectAccount(account: Account): Promise<void>;
    getDbRegistry(): DbRegistry;
    openDatabase(databaseName: string, config: DatabaseOpenConfig): Promise<IDatabase>;
    openDatastore(schemaName: string, config: DatastoreOpenConfig): Promise<Datastore>;
    deleteDatabase(databaseName: string, config?: DatabaseDeleteConfig): Promise<void>;
    logout(): void;
    addEndpoint(context: Context, uri: string): Promise<boolean>;
    info(): Promise<ContextDatabaseInfo>;
}
export default BaseStorageEngine;

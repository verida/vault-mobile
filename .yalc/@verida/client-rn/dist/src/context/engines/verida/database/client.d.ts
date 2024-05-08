import { EndpointUsage, VeridaDatabaseAuthContext } from "@verida/types";
import { ServiceEndpoint } from 'did-resolver';
import Endpoint from "./endpoint";
/**
 * Interface for RemoteClientAuthentication
 */
export interface ContextAuth {
    refreshToken: string;
    accessToken: string;
    host: string;
}
/**
 * @category
 * Modules
 */
export declare class DatastoreServerClient {
    private endpoint;
    private authContext?;
    private storageContext;
    private serviceEndpoint;
    constructor(endpoint: Endpoint, storageContext: string, serviceEndpoint: ServiceEndpoint, authContext?: VeridaDatabaseAuthContext);
    setAuthContext(authContext: VeridaDatabaseAuthContext): Promise<void>;
    getPublicUser(): Promise<import("axios").AxiosResponse<any>>;
    getStatus(): Promise<import("axios").AxiosResponse<any>>;
    /**
     *
     * @param databaseName
     * @param config
     * @param retry Retry if an authentication error occurs
     * @returns
     */
    createDatabase(databaseName: string, config: any, retry: boolean): Promise<any>;
    checkReplication(databaseName?: string, retry?: boolean): Promise<any>;
    updateDatabase(databaseName: string, config?: any, retry?: boolean): Promise<any>;
    deleteDatabase(databaseName: string, retry?: boolean): Promise<any>;
    pingDatabases(databaseHashes: string[], isWritePublic: boolean, did?: string, contextName?: string, retry?: boolean): Promise<any>;
    getUsage(retry: boolean): Promise<EndpointUsage>;
    getDatabases(retry: boolean): Promise<void>;
    getDatabaseInfo(databaseName: string, retry: boolean): Promise<any>;
    private reAuth;
    private getAxios;
}
export default DatastoreServerClient;

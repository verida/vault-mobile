import { DIDClient } from "@verida/did-client";
import { IAccount, SecureContextEndpoint, SecureContextConfig } from "@verida/types";
import { Network } from "@verida/types";
/**
 * Manage all the available storage contexts for all the DIDs being requested,
 *
 * Can force creating a new storage context for the authenticated account.
 */
/**
 * @category
 * Modules
 */
declare class DIDContextManager {
    private didContexts;
    private didClient;
    private network;
    private account?;
    constructor(network: Network, didClient: DIDClient);
    setAccount(account: IAccount): void;
    getContextDatabaseServer(did: string, contextName: string, forceCreate?: boolean): Promise<SecureContextEndpoint>;
    getContextStorageServer(did: string, contextName: string, forceCreate?: boolean): Promise<SecureContextEndpoint>;
    getContextMessageServer(did: string, contextName: string, forceCreate?: boolean): Promise<SecureContextEndpoint>;
    getDIDContextHashConfig(did: string, contextHash: string): Promise<SecureContextConfig>;
    getDIDContextConfig(did: string, contextName: string, forceCreate?: boolean): Promise<SecureContextConfig>;
}
export default DIDContextManager;

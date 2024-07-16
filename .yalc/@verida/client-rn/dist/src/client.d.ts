import { IProfile, IClient, ClientConfig, DefaultClientConfig, IAccount, IContext, SecureContextConfig, Network } from "@verida/types";
import { DIDClient } from "@verida/did-client";
import Schema from "./context/schema";
import { DIDDocument } from "@verida/did-document";
import { ProfileDocument } from "@verida/types";
/**
 * @category
 * Modules
 */
declare class Client implements IClient {
    /**
     * Connection to the Verida DID Registry
     */
    didClient: DIDClient;
    /**
     * Helper instance to manage DID contexts
     */
    private didContextManager;
    /**
     * Connected account instance
     */
    private account?;
    /**
     * DID of connected account
     */
    private did?;
    /**
     * Verida network this client is connected to
     */
    private network;
    private nameClient;
    /**
     * Current configuration for this client
     */
    private config;
    /**
     * Create a client connection to the Verida network
     *
     * @param userConfig ClientConfig Configuration for establishing a connection to the Verida network
     */
    constructor(userConfig: ClientConfig);
    /**
     * Connect an Account to this client.
     *
     * Sets the account owner who can then create storage contexts,
     * authenticate with databases, send messages etc.
     *
     * @param account AccountInterface
     */
    connect(account: IAccount): Promise<void>;
    /**
     * Check if an account is connected to this client.
     *
     * @returns boolean True of an account is connected
     */
    isConnected(): boolean;
    getNetwork(): Network;
    /**
     * Open a storage context for the current account.
     *
     * @param contextName string Name of the `context` to open.
     * @param forceCreate boolean If the `context` doesn't already exist for the connected account, create it. Depending on the type of `Account` connected, this may open a prompt for the user to confirm (and sign).
     * @returns Context | undefined
     */
    openContext(contextName: string, forceCreate?: boolean): Promise<IContext | undefined>;
    /**
     *
     * @param contextName The name of the context OR a context hash (starting with 0x)
     * @param did
     * @returns
     */
    openExternalContext(contextName: string, did: string): Promise<IContext>;
    /**
     * Get the storage configuration of an application context for a given DID.
     *
     * This provides the public details about the database, storage and messaging endpoints stored on did-client/did-document  for the requested `did`.
     *
     * @param did
     * @param contextName The name of the context OR a context hash (starting with 0x)
     * @returns SecureContextConfig | undefined
     */
    getContextConfig(did: string, contextName: string): Promise<SecureContextConfig | undefined>;
    getConfig(): DefaultClientConfig;
    getPublicProfile(did: string, contextName: string, profileName?: string, fallbackContext?: string | null, ignoreCache?: boolean, networkFallback?: boolean): Promise<ProfileDocument | undefined>;
    /**
     * Open the public profile of any user in read only mode.
     *
     * Every application context has the ability to have it's own public profiles.
     *
     * You most likely want to request the `Verida: Vault` context.
     *
     * @param did
     * @param contextName
     * @returns `<Profile | undefined>`
     */
    openPublicProfile(did: string, contextName: string, profileName?: string, fallbackContext?: string | null): Promise<IProfile | undefined>;
    /**
     * Get the valid data signatures for a given database record.
     *
     * Iterates through all the signatures attached to a database record and validates each signature.
     *
     * Only returns the signatures that are valid.
     *
     * @param data A single database record
     * @param did An optional did to filter the results by
     * @returns string[] Array of DIDs that have validly signed the data
     */
    getValidDataSignatures(data: any, did?: string): Promise<string[]>;
    destroyAccount(): Promise<void>;
    destroyContext(contextName: string): Promise<any>;
    getContextNameFromHash(contextHash: string, didDocument?: DIDDocument): Promise<any>;
    /**
     * Get a Schama instance by URL.
     *
     * @param schemaUri URL of the schema
     * @returns Schema A schema object
     */
    getSchema(schemaUri: string): Promise<Schema>;
    /**
     * Converts a string that may be either a valid DID or a valid Verida username into
     * a Verida username.
     *
     * @param didOrUsername DID string or Verida username string (ending in `.vda`)
     * @returns
     */
    parseDid(didOrUsername: string): Promise<string>;
    /**
     * Get the DID linked to a username
     *
     * @param username
     * @returns
     */
    getDID(username: string): Promise<string>;
    /**
     * Get an array of usernames linked to a DID
     *
     * @param did
     * @returns
     */
    getUsernames(did: string): Promise<string[]>;
}
export default Client;

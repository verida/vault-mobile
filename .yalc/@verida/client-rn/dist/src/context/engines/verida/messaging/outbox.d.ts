import { Keyring } from "@verida/keyring";
import Datastore from "../../../datastore";
import DIDContextManager from "../../../../did-context-manager";
import Context from "../../../context";
import { MessageSendConfig } from "@verida/types";
/**
 * @category
 * Modules
 */
declare class VeridaOutbox {
    private accountDid;
    private contextName;
    private keyring;
    private outboxDatastore;
    private context;
    private didContextManager;
    private inboxes;
    constructor(contextName: string, accountDid: string, keyring: Keyring, outboxDatastore: Datastore, context: Context, didContextManager: DIDContextManager);
    /**
     * Send a message to another user's application inbox. The message is converted to
     * a DID-JWT, signed by this application user (sender).
     *
     * The message is then encrypted using the recipients public key and saved
     * to their public inbox with date/time metadata removed.
     *
     * @param {string} did User's public DID
     * @param {string} type Type of inbox entry (ie: /schemas/base/inbox/type/dataSend)
     * @param {object} data Data to include in the message. Must match a particular
     *  schema or be an array of schema objects
     * @param {string} message Message to show the user describing the inbox message
     * @param {config} config Optional config (TBA). ie: specify `appName` if sending to a specific application
     */
    send(did: string, type: string, data: object, message: string, config: MessageSendConfig): Promise<object | null>;
    /**
     * Get the inbox Datastore for a user by DID (and
     * optionally application name)
     *
     * @param {string} did User's public DID
     * @param {object} config Config to be passed to the dataserver
     */
    private getInboxDatastore;
    validateData(type: string, data: any): boolean;
}
export default VeridaOutbox;

/// <reference types="node" />
import Inbox from "./inbox";
import Context from "../../../context";
import { IMessaging, MessagesConfig, MessageSendConfig } from "@verida/types";
import { Account } from "@verida/account";
import { EventEmitter } from 'events';
/**
 * @category
 * Modules
 */
declare class MessagingEngineVerida implements IMessaging {
    private context;
    private contextName;
    private maxItems;
    private didContextManager;
    private did?;
    private keyring?;
    private inbox?;
    private outbox?;
    constructor(context: Context, config?: MessagesConfig);
    init(): Promise<void>;
    connectAccount(account: Account): Promise<void>;
    /**
     * Send a message to another DID on the network
     *
     * @param did
     * @param type
     * @param data
     * @param message
     * @param config
     */
    send(did: string, type: string, data: object, message: string, config: MessageSendConfig): Promise<object | null>;
    /**
     * Register a callback to fire when a new message is received
     *
     * @returns {EventEmitter}
     */
    onMessage(callback: any): Promise<EventEmitter>;
    offMessage(callback: any): Promise<void>;
    getMessages(filter?: object, options?: any): Promise<any>;
    getInbox(): Promise<Inbox>;
    private getOutbox;
}
export default MessagingEngineVerida;

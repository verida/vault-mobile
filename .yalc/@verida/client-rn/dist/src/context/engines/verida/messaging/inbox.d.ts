/// <reference types="node" />
import { EventEmitter } from 'events';
import { Keyring } from "@verida/keyring";
import Context from "../../../context";
/**
 * @category
 * Modules
 */
declare class VeridaInbox extends EventEmitter {
    private context;
    private keyring;
    private initComplete;
    private privateInbox?;
    private publicInbox?;
    protected maxItems: Number;
    constructor(context: Context, keyring: Keyring, maxItems?: Number);
    private processAll;
    private processItem;
    getItem(itemId: string, options: any): Promise<any>;
    watch(): Promise<void>;
    watchPrivateChanges(): Promise<void>;
    /**
     * Initialise the inbox manager
     *
     * @todo: (bug) This opens the datastore based on the database endpoint, needs to open the datastore
     * based on the messaging endpoint (when we support additional types)
     */
    init(): Promise<void>;
    getInboxDatastore(): Promise<any>;
    /**
     * Garbage collection. Remove inbox items past the max limit.
     */
    _gc(): Promise<void>;
}
export default VeridaInbox;

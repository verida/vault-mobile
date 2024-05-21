/// <reference types="node" />
import { IContext, IDatabase } from "@verida/types";
import { EventEmitter } from 'events';
/**
 *
 * Note: May need the ability to force override the DID if migrating data between testnet -> mainnet?
 *
 * @param sourceContext
 * @param destinationContext
 */
export declare function migrateContext(sourceContext: IContext, destinationContext: IContext): EventEmitter;
export declare function migrateDatabase(sourceDb: IDatabase, destinationDb: IDatabase): Promise<void>;

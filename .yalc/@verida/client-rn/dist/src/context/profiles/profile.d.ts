/// <reference types="pouchdb-core" />
declare const EventEmitter: any;
import { IProfile } from "@verida/types";
import Context from "../context";
/**
 * A key/value profile datastore for a user
 */
/**
 * @category
 * Modules
 */
export declare class Profile extends EventEmitter implements IProfile {
    private context;
    private did;
    private profileName;
    private store?;
    private writeAccess;
    private isPrivate;
    errors: object;
    /**
     * Create a new user profile.
     *
     * **Do not instantiate directly.**
     *
     * Access the current user's profile
     *
     * @constructor
     */
    constructor(context: Context, did: string, profileName: string, writeAccess: boolean, isPrivate?: boolean);
    /**
     * Get a profile value by key
     *
     * @param {string} key Profile key to get (ie: `email`)
     * @param options
     * @param extended
     * @example
     * let emailDoc = app.wallet.profile.get('email');
     *
     * // key = email
     * // value = john@doe.com
     * console.log(emailDoc.key, emailDoc.value);
     * @return {object} Database record for this profile key. Object has keys [`key`, `value`, `_id`, `_rev`].
     */
    get(key: string, options?: any, extended?: boolean): Promise<any | undefined>;
    /**
     *
     * @param {string} key Profile key to delete (ie: `email`)
     * @returns {boolean} Boolean indicating if the delete was successful
     */
    delete(key: string): Promise<boolean>;
    /**
     * Get many profile values.
     *
     * @param filter
     * @param {object} [options] Database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     */
    getMany(filter: any, options: any): Promise<any>;
    /**
     * Set a profile value by key
     *
     * @param {string} key Profile key to set (ie: `email`)
     * @param {*} value Value to save
     * @example
     * // Set a profile value by key
     * app.wallet.profile.set('name', 'John');
     *
     * // Update a profile value from an existing document
     * let emailDoc = app.wallet.profile.get('email');
     * app.wallet.profile.set(emailDoc, 'john@doe.com');
     *
     * // Update a profile profile by key
     * app.wallet.profile.set('email', 'john@doe.com');
     * @returns {boolean} Boolean indicating if the save was successful
     */
    set(key: string, value: any): Promise<any>;
    /**
     * Set many profile key / values at once
     *
     * @param data
     */
    setMany(data: any): Promise<any>;
    /**
     * Listen for changes to the public profile
     */
    listen(callback: any): Promise<any>;
    verifyWebsite(): Promise<boolean>;
    private getRecord;
    private saveRecord;
    private init;
}
export {};

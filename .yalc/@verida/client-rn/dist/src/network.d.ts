import { NetworkConnectionConfig } from "@verida/types";
import { Context } from ".";
/**
 * @category
 * Modules
 */
declare class Network {
    /**
     * Opens a new application context to provide encrypted storage and messaging to an application.
     *
     * This is a quicker alternative to generating a `client` connection to the Verida network
     * and then opening a context.
     *
     * @param config NetworkConnectionConfig Configuration
     * @returns {Context | undefined} If the user logs in a valid `Context` object is returned. If an unexpected error occurs or the user cancels the login attempt then nothing is returned.
     */
    static connect(config: NetworkConnectionConfig): Promise<Context | undefined>;
    static getRecord(veridaUri: string, encoded?: boolean): Promise<any>;
}
export default Network;

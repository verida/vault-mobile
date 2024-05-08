/**
 * @category
 * Modules
 */
declare class Utils {
    static sleep(ms: number): Promise<unknown>;
    static buildDatabaseHash(databaseName: string, contextName: string, did: string): string;
}
export default Utils;
